import { useState, useMemo, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/DataTable";
import { ReportDetailModal } from "@/components/ReportDetailModal";
import { AdvancedFilter, FilterState } from "@/components/AdvancedFilter";
import { DataRecord, ApprovalTag } from "@/shared/types";
import { Eye, Image as ImageIcon, FileText } from "lucide-react";
import { useReport } from "@/hooks/useReport";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ScoreBadge";

interface ApiDataRecord {
  _id: string;
  createdDate: string;
  dataImgID: string;
  dataTextID: string;
  eval: number;
  lat: number;
  lon: number;
  qualified: boolean;
  segmentID: string;
  statusID: string | null;
  uploaderID: string;
  dataID: string;
}

export default function ReportManagement() {
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiData, setApiData] = useState<ApiDataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"all" | "unqualified">("unqualified"); 
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    contentType: "all",
    minScore: "",
    maxScore: "",
    submittedBy: "",
  });

  const { getAllUnqualifiedReport, getAllReport } = useReport();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data =
      viewMode === "all"
        ? await getAllReport()
        : await getAllUnqualifiedReport();
      setApiData(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setApiData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const transformedData: DataRecord[] = useMemo(() => {
    return apiData.map((record) => ({
      id: record._id,
      description: `Segment: ${record.segmentID}`,
      statusID: record.statusID ?? null,
      score: Math.round(record.eval * 100),
      dataID: record.dataImgID ? record.dataImgID : record.dataTextID,
      contentType: record.dataImgID ? "image" : "text",
      submittedBy: record.uploaderID,
      submittedAt: new Date(record.createdDate).toLocaleString("vi-VN") ,
      content: record.dataImgID || record.dataTextID,
      qualified: record.qualified,
      metadata: {
        location: `${record.lat}, ${record.lon}`,
        lat: record.lat,
        lon: record.lon,
        segmentID: record.segmentID,
        qualified: record.qualified,
        statusID: record.statusID,
      },
    }));
  }, [apiData]);

  const handleViewDetail = (record: DataRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      contentType: "all",
      minScore: "",
      maxScore: "",
      submittedBy: "",
    });
  };

  const filteredData = useMemo(() => {
    return transformedData.filter((record) => {
      const matchesSearch =
        filters.search === "" ||
        record.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesContentType =
        filters.contentType === "all" || record.contentType === filters.contentType;

      const matchesSubmittedBy =
        filters.submittedBy === "" ||
        record.submittedBy
          .toLowerCase()
          .includes(filters.submittedBy.toLowerCase());

      const minScore = filters.minScore ? parseInt(filters.minScore) : 0;
      const maxScore = filters.maxScore ? parseInt(filters.maxScore) : 100;
      const matchesScore = record.score >= minScore && record.score <= maxScore;

      return (
        matchesSearch && 
        matchesContentType && 
        matchesSubmittedBy &&
        matchesScore
      );
    });
  }, [transformedData, filters]);

  const columns: ColumnDef<DataRecord>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      className: "font-mono font-medium",
    },
    {
      key: "createdDate",
      header: "Created Date",
      sortable: true,
      className: "text-sm font-mono text-muted-foreground",
      render: (record) => new Date(record.submittedAt).toLocaleString(),
    },
    {
      key: "contentType",
      header: "Type",
      sortable: true,
      render: (record) => (
        record.contentType === 'image' ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            Image
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Text
          </div>
        )
      ),
    },
    {
      key: "location",
      header: "Location (Lat, Lon)",
      render: (record:any) => (
        <span className="text-sm text-muted-foreground">
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
              <Badge variant={record.metadata?.qualified ? "default" : "outline"}>
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
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <AdvancedFilter
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() =>
              setFilters({
                search: "",
                status: "all",
                contentType: "all",
                minScore: "",
                maxScore: "",
                submittedBy: "",
              })
            }
          />

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
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>Showing {apiData.length} records</>
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
            <DataTable
              data={filteredData}
              columns={columns}
              getRowKey={(record) => record.id}
              onRowClick={handleViewDetail}
            />
          )}
        </div>
      </main>

      <ReportDetailModal
        data={selectedRecord as any}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onReload={fetchData}
        // onApprove={handleApprove}
        // onReject={handleReject}
      />
    </div>
  );
}