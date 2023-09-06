import { Input } from "antd";
interface EditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  record: any;
  index: number;
  children: React.ReactNode;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing ? (
        <Input
          defaultValue={record[dataIndex]}
          onChange={(e) => (record[dataIndex] = e.target.value)}
        />
      ) : (
        children
      )}
    </td>
  );
};
