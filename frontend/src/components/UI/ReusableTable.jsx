import React from "react";
import PropTypes from "prop-types";
import styled, { keyframes } from "styled-components";
import { devices } from "../../assets/utils/constantes";

// Componente Tabela Bottstrap reutilizável

const Scale = keyframes`
    0% {
    transform: scale(0);
  }


  100% {
    transform: scale(1);
  }
`;

const TableStyleWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  margin-bottom: 1rem;
  animation: ${Scale} 0.6s ease-out;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 4px;
  }

  .table {
    margin-bottom: 0;
    width: 100%;
    min-width: 800px;
    border-collapse: collapse;
  }

  .table th {
    background-color: var(--primary-color);
    color: white;
    border: none;
    font-weight: 700;
    text-align: center;
    padding: 0.75rem;
    white-space: nowrap;
  }

  .table td {
    vertical-align: middle;
    text-align: center;
    padding: 0.5rem;
  }

  @media only screen and(${devices.mobileG}) {
    margin: 0 -1rem;
    border-radius: 0;

    .table {
      font-size: 0.92rem;
    }
  }
`;

const ReusableTable = ({
  columns,
  data,
  actions,
  loading,
  error,
  emptyMessage,
}) => (
  <>
    {/* Componente table para reutilização */}
    <TableStyleWrapper className="table-responsive">
      <table className="table table-striped table-bordered table-hover">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col}>{col.label || col}</th>
            ))}
            {actions && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                style={{ textAlign: "center" }}
              >
                A carregar...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                style={{ textAlign: "center", color: "var(--danger-color)" }}
              >
                {error}
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td key={col.key || col}>
                    {col.render ? col.render(row) : row[col.key || col]}
                  </td>
                ))}
                {actions && <td>{actions(row)}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                style={{ textAlign: "center" }}
              >
                {emptyMessage || "Sem registos"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </TableStyleWrapper>
  </>
);

// PropTypes para validação das props
ReusableTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      render: PropTypes.func,
    }),
  ).isRequired,
  data: PropTypes.array.isRequired,
  actions: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default ReusableTable;
