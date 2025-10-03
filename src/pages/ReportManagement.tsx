import { useState, useMemo, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/DataTable";
import { ReportDetailModal } from "@/components/ReportDetailModal";
import { DataRecord } from "@/shared/types";
import { Eye, Image, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useReport } from "@/hooks/useReport";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ScoreBadge";

interface ApiDataRecord {
  _id: string;
  createdDate: Date;
  dataImgID: string;
  dataTextID: string;
  eval: number;
  lat: number;
  lon: number;
  qualified: boolean;
  segmentID: string;
  statusID: string | null;
  uploaderID: string;
}

export default function ReportManagement() {
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiData, setApiData] = useState<ApiDataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"all" | "unqualified"| "valid" | "invalid" | "needValidation" >("all");
  const [total, setTotal] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { getAllUnqualifiedReport, getAllReport, getAllValidReport, getAllInvalidReport, getAllNeededValidationReport } = useReport();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const offset = (currentPage - 1) * pageSize;
      
      let response;
      switch (viewMode) {
        case "all":
          response = await getAllReport(pageSize, offset);
          break;
        case "unqualified":
          response = await getAllUnqualifiedReport(pageSize, offset);
          break;
        case "valid":
          response = await getAllValidReport(pageSize, offset);
          break;
        case "invalid":
          response = await getAllInvalidReport(pageSize, offset);
          break;
        case "needValidation":
          response = await getAllNeededValidationReport(pageSize, offset);
          break;
        default:
          response = await getAllReport(pageSize, offset);
      }
      setApiData(response?.data || []);
      setTotal(response?.total || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      setApiData([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewMode, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  const transformedData: DataRecord[] = useMemo(() => {
    return apiData.map((record) => {
      const hasImage = !!record.dataImgID;
      const hasText = !!record.dataTextID;
      const hasBoth = hasImage && hasText;

      let contentType: "image" | "text" | "both" = "text";
      if (hasBoth) {
        contentType = "both";
      } else if (hasImage) {
        contentType = "image";
      }

      const date = new Date(record.createdDate);
      
      return {
        id: record._id,
        description: `Segment: ${record.segmentID}`,
        statusID: record.statusID ?? null,
        score: Math.round(record.eval * 100),
        dataImgID: record.dataImgID,
        dataTextID: record.dataTextID,
        contentType: contentType,
        submittedBy: record.uploaderID,
        submittedAt: new Date(date.setHours(date.getHours()-7)).toLocaleString("vi-VN"),
        content: record.dataImgID || record.dataTextID,
        qualified: record.qualified,
        metadata: {
          location: `${record.lat}, ${record.lon}`,
          lat: record.lat,
          lon: record.lon,
          segmentID: record.segmentID,
          qualified: record.qualified,
          statusID: record.statusID,
          dataImgID: record.dataImgID,
          dataTextID: record.dataTextID,
        },
      };
    });
  }, [apiData]);

  const handleViewDetail = (record: DataRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil(total / pageSize);
  const startRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, total);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const columns: ColumnDef<DataRecord>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      className: "font-mono font-medium",
    },
    {
      key: "submittedAt",
      header: "Created Date",
      sortable: true,
      className: "text-sm font-mono",
      render: (record) => record.submittedAt,
    },
    {
      key: "contentType",
      header: "Type",
      sortable: true,
      render: (record) => {
        if (record.contentType === 'both') {
          return (
            <div className="flex items-center gap-1.5 text-sm">
              <Image className="h-4 w-4" />
              <FileText className="h-4 w-4" />
              <span>Both</span>
            </div>
          );
        } else if (record.contentType === 'image') {
          return (
            <div className="flex items-center gap-1.5 text-sm">
              <Image className="h-4 w-4" />
              Image
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-1.5 text-sm">
              <FileText className="h-4 w-4" />
              Text
            </div>
          );
        }
      },
    },
    {
      key: "location",
      header: "Location (Lat, Lon)",
      render: (record: any) => (
        <span className="text-sm">
          {record.metadata?.location || 'N/A'}
        </span>
      ),
    },
    ...(viewMode === "all"
      ? [
          {
            key: "qualified",
            header: "Qualified",
            sortable: true,
            render: (record: DataRecord) => (
              <Badge variant={record.metadata?.qualified ? "default" : "destructive"}>
                {record.metadata?.qualified ? "Yes" : "No"}
              </Badge>
            ),
          } as ColumnDef<DataRecord>,
        ]
      : []),
    {
      key: "score",
      header: "Score",
      sortable: true,
      render: (record) => <ScoreBadge score={record.score} />,
    },
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
          <Eye className="h-4 w-4 mr-2" />
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-background ">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("all")}
              >
                All Report
              </Button>
              <Button
                variant={viewMode === "unqualified" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("unqualified")}
              >
                Unqualified Report
              </Button>
              <Button
                variant={viewMode === "valid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("valid")}
              >
                Valid Report
              </Button>
              <Button
                variant={viewMode === "invalid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("invalid")}
              >
                Invalid Report
              </Button>
              <Button
                variant={viewMode === "needValidation" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("needValidation")}
              >
                Report Need Validation
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>Total: {total} records</>
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
              >
                Reload
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading data...</div>
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
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
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
                      onClick={handlePreviousPage}
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
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <ReportDetailModal
        data={selectedRecord as any}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onReload={fetchData}
      />
    </div>
  );
}