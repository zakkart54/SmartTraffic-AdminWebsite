import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "./ScoreBadge";
import { DataRecord, ApprovalTag } from "@/shared/types";
import { CheckCircle, XCircle, ImageIcon, FileText, MapPin, Calendar, Clock, IdCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useData } from "@/hooks/useData";
import {useReport} from "@/hooks/useReport";
import { useToast } from "@/hooks/use-toast";

interface ReportDetailModalProps {
  data: DataRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReload: () => void;
}

export function ReportDetailModal({
  data,
  open,
  onOpenChange,
  onReload
}: ReportDetailModalProps) {
  const [showApprovalOptions, setShowApprovalOptions] = useState(false);
  const [selectedTags, setSelectedTags] = useState<ApprovalTag[]>([]);
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast()
  const { getDataDetail } = useData();
  const { manualVerify } = useReport();

  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);

  const resetStates = () => {
    setSelectedTags([]);
    setConfirmRejectOpen(false);
  };

  const handleRejectConfirm = () => {
    setConfirmRejectOpen(true);
    return;
  };

  const handleReject = async () => {
    const rejectData = {
      id: data.id,
      valid: false,
      status:  {
        Obstacle:false,
        Flooded:false,
        TrafficJam:false,
        Police:false
      },
    };
    try {
      manualVerify.mutate(
        { ...rejectData },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Manual verify thành công.",
              color: "green"
            })
            resetStates();
            onOpenChange(false);
            onReload();
          },
          onError: (err) => {
            toast({
              title: "Error",
              description:
                err instanceof Error ? err.message : "Manual verify thất bại",
              variant: "destructive",
              color: "red"
            })
          }
        }
      );
    } catch (err) {
      toast({
        title: "Error",
        description: err as any,
        variant: "destructive",
      })
    }
    resetStates();
    onOpenChange(false);
  };

  const handleApprove = async () => {
    if (!showApprovalOptions) {
      setShowApprovalOptions(true);
      return;
    }
  
    if (selectedTags.length === 0) {
      return;
    }

    const tagMap: Record<string, string> = {
      obstacle: "Obstacle",
      flood: "Flooded",
      trafficjam: "TrafficJam",
      police: "Police"
    };

    const mappedStatus = selectedTags.reduce((acc, tag) => {
      const key = tagMap[tag];
      if (key) acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);

    try {
      const verifyData = {
        id: data.id,
        valid: true,
        status:  {
          Obstacle:false,
          Flooded:false,
          TrafficJam:false,
          Police:false,
          ...mappedStatus
        },
      };

      manualVerify.mutate(
        { ...verifyData },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Manual verify thành công.",
              color: "green"
            })
            resetStates();
            onOpenChange(false);
            onReload();
          },
          onError: (err) => {
            toast({
              title: "Error",
              description:
                err instanceof Error ? err.message : "Manual verify thất bại",
              variant: "destructive",
              color: "red"
            })
          }
        }
      );
    } catch (err) {
      toast({
        title: "Error",
        description: err as any,
        variant: "destructive",
      })
    }
    resetStates();
    onOpenChange(false);
  };

  useEffect(() => {
    if (data?.dataID && open) {
      setLoading(true);
      const fetchDetail = async () => {
        try {
          const result = await getDataDetail(data.dataID);
          setDetailData(result);
        } catch (error) {
          console.error("Error fetching detail:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [data?.dataID, open]);

  if (!data) return null;

  const approvalOptions: { value: ApprovalTag; label: string }[] = [
    { value: 'obstacle', label: 'Obstacle' },
    { value: 'flood', label: 'Flood' },
    { value: 'trafficjam', label: 'Traffic Jam' },
    { value: 'police', label: 'Police' },
  ];

  const handleClose = () => {
    setShowApprovalOptions(false);
    setSelectedTags([]);
    setDetailData(null);
    onOpenChange(false);
  };

  const toggleTag = (tag: ApprovalTag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-8 text-muted-foreground">Loading content...</div>;
    }

    if (!detailData?.content) {
      return <div className="text-center py-8 text-muted-foreground">No content available</div>;
    }

    const contentData = detailData.content;

    if (contentData.type === 'image') {
      return (
        <div className="mt-1 rounded-md border overflow-hidden">
          <img 
            src={`data:${detailData.image?.contentType || 'image/jpeg'};base64,${contentData.content}`}
            alt={data.id}
            className="w-full h-auto max-h-96 object-contain bg-muted"
            data-testid="image-content"
          />
        </div>
      );
    } else {
      return (
        <div className="mt-1 rounded-md bg-muted p-4">
          <pre className="text-sm whitespace-pre-wrap" data-testid="text-content">
            {contentData.content}
          </pre>
        </div>
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-semibold font-mono">
                  {data.id}
                </DialogTitle>
                <DialogDescription className="mt-2 flex items-center gap-2">
                  {data.contentType === 'image' ? (
                    <ImageIcon className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {data.contentType === 'image' ? 'Image Content' : 'Text Content'}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <ScoreBadge score={data.score} />
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Submitted By
                </label>
                <p className="mt-1 text-sm font-mono" data-testid="text-submitted-by">
                  {data.submittedBy}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Upload Time
                </label>
                <p className="mt-1 text-sm font-mono" data-testid="text-submitted-at">
                  {detailData?.data?.uploadTime ? formatDate(detailData.data.uploadTime) : data.submittedAt}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </label>
                <p className="mt-1 text-sm font-mono" data-testid="text-location">
                  {String (data.metadata?.location || 'N/A')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Segment ID
                </label>
                <p className="mt-1 text-sm font-mono" data-testid="text-segment">
                  {String(data.metadata?.segmentID || 'N/A')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Processed
                </label>
                <p className="mt-1 text-sm" data-testid="text-processed">
                  <Badge variant={detailData?.data?.processed ? "default" : "secondary"}>
                    {detailData?.data?.processed ? "Yes" : "No"}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status ID
                </label>
                <p className="mt-1 text-sm font-mono" data-testid="text-status-id">
                  {detailData?.data?.statusID || data.metadata?.statusID || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Qualified
                </label>
                <p className="mt-1 text-sm" data-testid="text-qualified">
                  <Badge variant={data.metadata?.qualified ? "default" : "outline"}>
                    {data.metadata?.qualified ? "Yes" : "No"}
                  </Badge>
                </p>
              </div>
            </div>

            {detailData?.data?.processed_time && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Processed Time
                </label>
                <p className="mt-1 text-sm font-mono" data-testid="text-processed-time">
                  {formatDate(detailData.data.processed_time)}
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </label>
              <p className="mt-1 text-sm" data-testid="text-description">
                {data.description}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Content
              </label>
              {renderContent()}
            </div>

            {data.approvalTags && data.approvalTags.length > 0 && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Approval Tags
                </label>
                <div className="mt-1 flex gap-2">
                  {data.approvalTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {detailData?.content?.source && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Source File
                </label>
                <p className="mt-1 text-xs font-mono text-muted-foreground" data-testid="text-source">
                  {detailData.content.source}
                </p>
              </div>
            )}

            {showApprovalOptions && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
                  Select Tags (at least 1 required)
                </label>
                <div className="space-y-3">
                  {approvalOptions.map(option => (
                    <div key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        id={option.value}
                        checked={selectedTags.includes(option.value)}
                        onCheckedChange={() => toggleTag(option.value)}
                        data-testid={`checkbox-${option.value}`}
                      />
                      <label
                        htmlFor={option.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              data-testid="button-close"
            >
              Close
            </Button>
            {!data.statusID && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRejectConfirm}
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                  data-testid="button-reject"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                   Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-approve"
                  disabled={showApprovalOptions && selectedTags.length === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {showApprovalOptions ? "Confirm Approval" : "Approve"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmRejectOpen} onOpenChange={setConfirmRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this report?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => handleReject()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}