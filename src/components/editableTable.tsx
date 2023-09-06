import React, { CSSProperties, useState } from "react";
import { Table, Input, Button, Popconfirm, Space } from "antd";
import { ColumnsType } from "antd/es/table";
import { TableRowSelection } from "antd/lib/table/interface";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { DraggableRow, DraggableRowProps } from "../utils/dragAndDropUtils";
import { EditableCell } from "../utils/editableCell";

const { TextArea } = Input;

export interface TableData {
  key: string;
  [key: string]: string | number;
}

export interface Column {
  dataIndex: string;
  title: string;
  inputType?: "text" | "textArea";
}

export interface EditableTableProps {
  data: TableData[];
  setData: (data: TableData[]) => void;
  columns: Column[];
  editable?: boolean;
  draggable?: boolean;
  addable?: boolean;
  multiDelete?: boolean;
  deleteSoftConfirm?: boolean;
  useExternalDndContext?: boolean;
  rowStyles?: Record<string, CSSProperties>; // Added this for custom row styles

  align?: 'left' | 'center' | 'right'; // align prop can only have these values
}

export const EditableTable: React.FC<EditableTableProps> = ({
  data = [],
  setData,
  columns,
  editable = true,
  draggable = true,
  addable = true,
  multiDelete = true,
  deleteSoftConfirm = true,
  align = "left",
  useExternalDndContext = false, // default value as false
  rowStyles = {}, // default value as an empty object


}) => {
  const [editingKey, setEditingKey] = useState("");
  const [currentRow, setCurrentRow] = useState<TableData | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const buttonStyle: CSSProperties = { margin: 11, textAlign: align || 'left' };

  const isEditing = (record: TableData) => record.key === editingKey;

  const handleAddRow = () => {
    let cur = data.map(({ key }) => parseInt(key));
    const newRow: TableData = {
      key: (Math.max(...cur, 0) + 1).toString(),
    };

    for (let column of columns) {
      newRow[column.dataIndex] = "";
    }

    setData([...data, newRow]);
    setEditingKey(newRow.key);
  };

  const cancel = (key: string) => {
    if (!currentRow) {
      setData(data.filter((item) => item.key !== key));
    } else {
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      newData[index] = { ...currentRow };
      setData(newData);
      setCurrentRow(null);
    }
    setEditingKey("");
  };

  const edit = (record: TableData) => {
    if (!editable) return;

    setCurrentRow({ ...record });
    setEditingKey(record.key);
  };

  const save = async (record: TableData) => {
    const newData = [...data];
    const index = newData.findIndex((item) => record.key === item.key);
    newData[index] = { ...record };
    setData(newData);
    setEditingKey("");
    setCurrentRow(null);
  };

  const handleDeleteSelected = () => {
    setData(data.filter((item) => !selectedRowKeys.includes(item.key)));
    setSelectedRowKeys([]);
  };

  const onSelectChange = (
    selectedKeys: (string | number)[],
    selectedRows: TableData[]
  ) => {
    setSelectedRowKeys(selectedKeys);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = data.findIndex((item) => item.key === active.id);
      const overIndex = data.findIndex((item) => item.key === over?.id);
      const newData = arrayMove(data, activeIndex, overIndex);
      setData(newData);
    }
  };

  const rowSelection: TableRowSelection<TableData> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  let tableColumns: ColumnsType<TableData> = columns.map((column) => ({
    title: column.title,
    dataIndex: column.dataIndex,
    render: (text: string, record: TableData) =>
      isEditing(record) ? (
        column.inputType === "textArea" ? (
          <TextArea
            defaultValue={text}
            onChange={(e) => {
              (record as any)[column.dataIndex] = e.target.value;
            }}
          />
        ) : (
          <Input
            defaultValue={text}
            onChange={(e) => {
              (record as any)[column.dataIndex] = e.target.value;
            }}
          />
        )
      ) : (
        text
      ),
  }));

  if (draggable) {
    tableColumns = [
      {
        title: "",
        dataIndex: "drag",
        key: "dragHandle",
        width: "5px",
        render: () => <MenuOutlined />,
      },
      ...tableColumns,
    ];
  }

  tableColumns.push({
    title: "Action",
    dataIndex: "action",
    width: "5px",
    render: (_, record: TableData) => {
      const editing = isEditing(record);
      return editing ? (
        <Space size="middle">
          <CheckOutlined
            onClick={() => save(record)}
            style={{ color: "green", cursor: "pointer" }}
          />
          <CloseOutlined
            onClick={() => cancel(record.key)}
            style={{ color: "red", cursor: "pointer" }}
          />
        </Space>
      ) : (
        
          <Space size="middle">
         {editable &&   <EditOutlined
              onClick={() => edit(record)}
              style={{ cursor: "pointer" }}
            /> }
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => {
                const newData = data.filter((item) => item.key !== record.key);
                setData(newData);
              }}
            >
              <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
            </Popconfirm>
          </Space>
       
      );
      
    },
  });
  const rowClassName = (record: TableData, index: number) => {
    if (rowStyles[record.key]) {
      return `custom-row-${record.key}`;
    }
    return "";
  };


  const DndComponent: React.FC = ({ children }) => {
    return useExternalDndContext ? (
      <SortableContext
      items={data.map((record) => record.key)}
      strategy={verticalListSortingStrategy}
    >
    {children}
      </SortableContext>

    ) : (
      <DndContext onDragEnd={onDragEnd}>
        <SortableContext
          items={data.map((record) => record.key)}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <DndComponent>
      <Table
        rowSelection={multiDelete ? rowSelection : undefined}
        columns={tableColumns}
        dataSource={data}
        pagination={false}
        rowClassName={rowClassName}
        components={{
          body: {
            row: (rowProps: JSX.IntrinsicAttributes & DraggableRowProps & { children?: React.ReactNode; }) => <DraggableRow {...rowProps} rowStyles={rowStyles} dataRowKey={rowProps["data-row-key"]} />, // pass rowStyles and dataRowKey
            cell: EditableCell,
          },
        }}
        
      />
      {selectedRowKeys.length > 0 && (
        <React.Fragment>
          {deleteSoftConfirm ? (
            <Popconfirm
              title="Really Delete Selected Rows?"
              onConfirm={handleDeleteSelected}
            >
              <Button danger style={buttonStyle}>
                Delete Selected Rows
              </Button>
            </Popconfirm>
          ) : (
            <Button danger onClick={handleDeleteSelected} style={buttonStyle}>
              Delete Selected Rows
            </Button>
          )}
        </React.Fragment>
      )}
      {addable && (
        <Button
          icon={<PlusOutlined />}
          onClick={handleAddRow}
          style={{ margin: 11, float: "right" }}
        >
          Add row
        </Button>
      )}
    </DndComponent>
  );
  
};

export default EditableTable;
