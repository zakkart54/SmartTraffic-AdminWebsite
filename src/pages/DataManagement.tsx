import { useState, useEffect, useMemo } from "react";
import { DataTable, ColumnDef } from "@/components/DataTable";
import { ReportDetailModal } from "@/components/ReportDetailModal";
import { Eye, Image, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ScoreBadge";

interface ApiDataRecord {
  _id: string;
  uploaderID: string;
  type: "image" | "text";
  InfoID: string;
  reportID: string | null;
  uploadTime: string;
  processed: boolean;
  processed_time: string | null;
  TrainValTest: number;
  location: string | null;
  statusID: string | null;
}

export default function DataManagement() {
  const [apiData, setApiData] = useState<ApiDataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"all" | "image" | "text" >("all");
  const [selectedRecord, setSelectedRecord] = useState<ApiDataRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;

      const response = {
        data: apiData,
        total: apiData.length,
      };

      setApiData(response.data);
      setTotal(response.total);
    } catch (err) {
      console.error(err);
      setApiData([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewMode, currentPage, pageSize]);

  const transformedData = useMemo(() => {
    return apiData.map((record) => {
      return {
        id: record._id,
        uploaderID: record.uploaderID,
        type: record.type,
        uploadTime: new Date(record.uploadTime).toLocaleString(),
        statusID: record.statusID,
        location: record.location ?? "N/A",
        metadata: record,
      };
    });
  }, [apiData]);

  const handleViewDetail = (record: any) => {
    setSelectedRecord(record.metadata);
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil(total / pageSize);
  const startRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, total);

  const columns: ColumnDef<any>[] = [
    { key: "id", header: "ID", className: "font-mono font-medium" },
    { key: "uploadTime", header: "Upload Time", className: "text-sm font-mono" },
    {
      key: "type",
      header: "Type",
      render: (record) => (
        <div className="flex items-center gap-1">
          {record.type === "image" && <><Image className="h-4 w-4" /> Image</>}
          {record.type === "text" && <><FileText className="h-4 w-4" /> Text</>}
          {record.type === "both" && (
            <>
              <Image className="h-4 w-4" />
              <FileText className="h-4 w-4" />
              Both
            </>
          )}
        </div>
      ),
    },
    { key: "location", header: "Location" },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (record) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(record);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("all")}
            >
              All
            </Button>
            <Button
              variant={viewMode === "image" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("image")}
            >
              Image
            </Button>
            <Button
              variant={viewMode === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("text")}
            >
              Text
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm">Total: {total}</p>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
              Reload
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading data...
          </div>
        ) : (
          <>
            <DataTable
              data={transformedData}
              columns={columns}
              getRowKey={(record) => record.id}
              onRowClick={handleViewDetail}
            />

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {[5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {startRecord}-{endRecord} of {total}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm font-medium px-3">
                    Page {currentPage} of {totalPages || 1}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages || isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* <ReportDetailModal
        data={selectedRecord}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onReload={fetchData}
      /> */}
    </div>
  );
}
