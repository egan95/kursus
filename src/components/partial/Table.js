import React from 'react';
import { useTable, usePagination, useGlobalFilter, useAsyncDebounce } from 'react-table'

function GlobalFilter ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  // const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <div>
        <input 
          type="text" 
          className='form-control mb-2'
          value={value || ""}
          onChange={e => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder='Search here...'
          />
    </div>
  )
}

function Table({ columns, data }) {
    const totalCols = columns.length;
    
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page, // Instead of using 'rows', we'll use page,
        // which has only the rows for the active page
    
        // The rest of these things are super handy, too ;)
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state,
        preGlobalFilteredRows,
        setGlobalFilter,
        state: { pageIndex, pageSize },
      } = useTable(
        {
          columns,
          data,
          initialState: { pageIndex: 0 },
        },
        useGlobalFilter,
        usePagination
      )
      
  return (
      <>
        {/* <pre>
        <code>
          {JSON.stringify(
            {
              pageIndex,
              pageSize,
              pageCount,
              canNextPage,
              canPreviousPage,
            },
            null,
            2
          )}
        </code>
      </pre> */}
      <div className="row">
          <div className="col-md-6 col-xs-12">
            <select
              className='form-control input-sm mb-2'
              value={pageSize}
              style={{ width: "auto" }}
              onChange={e => {
                setPageSize(Number(e.target.value))
              }}
            >
              {[5 ,10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4 offset-md-2 col-xs-12">
            <GlobalFilter 
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          </div>
        </div>
      <table {...getTableProps()} className='table table-hover table-bordered'>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {(page.length > 0 && page.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })) || <tr><td colSpan={totalCols} className='text-center'>Data Empty</td></tr>}
        </tbody>
      </table>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <div className="pagination row">
        
        
        {/* <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
            style={{ width: '100px' }}
          />
        </span>{' '} */}
        <div className="col-md-6">
            
        </div>
        <div className="col-md-6">
          <div className="float-end">
            <span className='ml-1'>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{' '}
            </span>
              <button type="button" className='btn btn-primary mx-1' onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                {'first'}
              </button>
              <button type="button" className='btn btn-primary mx-1' onClick={() => previousPage()} disabled={!canPreviousPage}>
                {'<'}
              </button>
              <button type="button" className='btn btn-primary mx-1' onClick={() => nextPage()} disabled={!canNextPage}>
                {'>'}
              </button>
              <button type="button" className='btn btn-primary mx-1' onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                {'last'}
              </button>
          </div>
        </div>
      </div>
      </>
  );
}

export default Table;
