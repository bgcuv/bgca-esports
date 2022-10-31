import React from "react";
import Head from "next/head";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useTable, useSortBy, useFilters, useGlobalFilter } from "react-table";
import clubs from "../data/esports";

// function to go through each object in the array and return the count of the number of times a game is found.
const countGames = (data) => {
  let games = {};
  data.forEach((club) => {
    club.games.forEach((game) => {
      if (games[game]) {
        games[game] += 1;
      } else {
        games[game] = 1;
      }
    });
  });
  return games;
};

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = (value) => setGlobalFilter(value || undefined);

  return (
    <span>
      Search:{" "}
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: "1.1rem",
          border: "0",
        }}
      />
    </span>
  );
}

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

export default function Home() {
  const gamesSet = new Set();
  const gamesArray = [];
  for (const club of clubs) {
    for (const game of club.system) {
      gamesSet.add(game);
      gamesArray.push(game);
    }
  }
  const games = countGames(clubs);

  let sortable = [];
  for (var [game, count] of Object.entries(games)) {
    sortable.push([game, games[game]]);
  }

  sortable.sort(function (a, b) {
    return a[1] - b[1];
  });

  const columns = React.useMemo(
    () => [
      { Header: "Name", accessor: `name` },
      { Header: "Staff", accessor: `staff` },
      { Header: "Email", accessor: `email` },
      { Header: "State", accessor: `state` },
      { Header: "Tag", accessor: `tag` },
      { Header: "System", accessor: `system` },
      { Header: "Games", accessor: `games` },
      { Header: "Preferred Day", accessor: `preferredDay` },
      { Header: "Preferred Time", accessor: `preferredTime` },
      { Header: "Twitch", accessor: `twitch` },
    ],
    []
  );
  const data = React.useMemo(() => clubs, []);

  const filterTypes = React.useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  return (
    <div>
      <Head>
        <title>BGCA eSports Clubs</title>
        <meta name="description" content="A hub for BGCA eSports" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Table {...getTableProps()} variant="striped" size="sm">
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th key={column.id}>
                  <span
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render("Header")}
                  </span>
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                  <div>{column.canFilter ? column.render("Filter") : null}</div>
                </Th>
              ))}
            </Tr>
          ))}
          <tr>
            <th
              colSpan={visibleColumns.length}
              style={{
                textAlign: "left",
              }}
            >
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </th>
          </tr>
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <Tr key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  if (typeof cell.value === "object") {
                    return (
                      <Td key={cell.id} {...cell.getCellProps()}>
                        {cell.value.join(", ")}
                      </Td>
                    );
                  }
                  return (
                    <Td key={cell.id} {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <footer></footer>
    </div>
  );
}
