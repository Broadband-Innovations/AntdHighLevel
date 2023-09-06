import { useSortable } from "@dnd-kit/sortable";
import { DragOutlined } from "@ant-design/icons";
import { CSS } from "@dnd-kit/utilities";
import React, { ReactElement, CSSProperties } from "react";

export interface DraggableRowProps {
  index: number;
  moveRow?: (from: number, to: number) => void;
  className?: string;
  style?: CSSProperties;
  rowStyles?: Record<string, CSSProperties>; // Added rowStyles
  dataRowKey?: string; // Added dataRowKey to find custom row styles
  [key: string]: any;
}

export const DraggableRow: React.FC<DraggableRowProps> = (props) => {
  const {
    index,
    moveRow,
    className,
    style,
    rowStyles,
    dataRowKey,
    ...restProps
  } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${restProps["data-row-key"]}`,
  });

  const customRowStyles = rowStyles && dataRowKey ? rowStyles[dataRowKey] : {}; // Fetch custom row styles

  const draggableStyle: CSSProperties = {
    ...style,
    ...customRowStyles, // Merge custom row styles
    transform: CSS.Transform.toString(
      transform && { ...transform, scaleY: 1 }
    )?.replace(/translate3d\(([^,]+),/, "translate3d(0,"),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  return (
    <tr
      {...restProps}
      ref={setNodeRef}
      className={className}
      style={draggableStyle}
      {...attributes}
    >
      {React.Children.map(props.children, (child) => {
        if ((child as ReactElement).key === "dragHandle") {
          return React.cloneElement(child as ReactElement, {
            children: (
              <DragOutlined
                ref={setActivatorNodeRef}
                style={{ touchAction: "none", cursor: "move" }}
                {...listeners}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};
