import React from 'react'
import { Table } from '../../../../../../components/ui/table'
import THead from './t-head'
import { LogTableEntry } from '../../../../../../types/type'
import { useLogStore } from '../../../../../../stores/useLogStore'
import TBody from './t-body'
import { SolutionSlideOver } from '../Solution-SlideOver'
import { Typography } from '../../../../../../components/ui/typography'
import { useParams } from 'react-router-dom'
import { fetchLogTableData } from '../../../../../../services/api/fetch-log-table-data'
import { useQuery } from '@tanstack/react-query'
import InfiniteScroll from 'react-infinite-scroll-component'

const LogTable: React.FC = () => {
  const {
    tableData,
    setOpenSlideOver,
    setSelectedLog,
    openSlideOver,
    selectedLog,
    incrementPage,
    loading,
    totalLogs,
    limit,
    resetTableData
    // page
  } = useLogStore()
  const { project_id } = useParams()
  console.log('project_id ===>>', project_id)
  const cd_id = localStorage.getItem('cd_id') ?? ''
  const cd_secret = localStorage.getItem('cd_secret') ?? ''

  const { isLoading, error } = useQuery({
    queryKey: ['log-table', cd_id, cd_secret, project_id],
    queryFn: () => {
      resetTableData()
      return fetchLogTableData(project_id ?? '')
    },
    refetchOnWindowFocus: false
  })

  const fetchMoreData = () => {
    if (!loading && tableData.length < (totalLogs || Infinity)) {
      incrementPage()
      fetchLogTableData(project_id ?? '')
    }
  }

  const handleRowClick = async (data: LogTableEntry) => {
    setSelectedLog(data)
    setOpenSlideOver(true)
  }
  return (
    <div>
      <Typography variant="xl" className=" px-2 py-2 ">
        Error logs
      </Typography>
      <Table>
        <THead />
      </Table>
      <div
        id="scrollableDiv"
        className="w-full max-h-[calc(100dvh-46dvh)] overflow-y-scroll relative scrollbar scrollbar-hide"
      >
        <InfiniteScroll
          dataLength={tableData.length} // Current data length
          next={fetchMoreData} // Function to fetch the next page
          hasMore={tableData.length >= limit} // Stop scrolling when all logs are loaded
          loader={loading && <p className="text-center my-4">Loading...</p>} // Loader shown during fetch
          scrollableTarget="scrollableDiv" // Target for scrollable container
        >
          <Table>
            <TBody tableData={tableData ?? []} onRowClick={handleRowClick} />
          </Table>
        </InfiniteScroll>
      </div>
      {isLoading ? (
        <p className="text-center my-5">Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : null}
      {tableData === null ||
        (tableData.length === 0 && !loading && (
          <Typography variant="sm" className="text-muted-foreground px-2 py-8 text-center">
            No logs found.
          </Typography>
        ))}
      <SolutionSlideOver
        open={openSlideOver}
        onOpenChange={setOpenSlideOver}
        errorLog={selectedLog}
        onMarkResolved={() => setOpenSlideOver(false)}
      />
    </div>
  )
}

export default LogTable
