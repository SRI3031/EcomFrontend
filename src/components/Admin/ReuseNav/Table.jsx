// src/components/reusable/Table.jsx
import React from "react";

const Table = ({ columns, data, actions, selectedId, onRowClick }) => {
  return (
    <div
      className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-colors duration-300"
      style={{ maxHeight: "70vh" }}
    >
      {/* Scroll container for both directions */}
      <div
        className="overflow-auto"
        style={{ maxHeight: "70vh", width: "100%" }}
      >
        <table className="min-w-full border-collapse divide-y divide-gray-100">
          {/* Sticky Header */}
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50"
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right bg-gray-50"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Scrollable Body */}
          <tbody className="bg-white divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((row, rowIndex) => {
                const rowId = row._id || row.id;
                return (
                  <tr
                    key={rowIndex}
                    id={`row-${rowId}`}
                    onClick={() => onRowClick && onRowClick(rowId)}
                    className={`cursor-pointer transition-colors duration-200 ${
                      selectedId === rowId ? "bg-amber-100" : "hover:bg-gray-100"
                    }`}
                  >
                    {columns.map((column, colIndex) => {
                      let cellContent;

                      // If column defines a custom cell, use it
                      if (column.cell) {
                        cellContent = column.cell(row);
                      } else {
                        // Otherwise, try to access via accessor
                        const value = row[column.accessor];
                        if (
                          value === null ||
                          value === undefined ||
                          typeof value === "object"
                        ) {
                          cellContent = "-"; // fallback for objects
                        } else {
                          cellContent = value;
                        }
                      }

                      return (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                    {actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-8 text-gray-500"
                >
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;