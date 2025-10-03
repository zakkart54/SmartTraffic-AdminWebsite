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
import { CheckCircle, XCircle, ImageIcon, FileText, MapPin, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useData } from "@/hooks/useData";
import { useReport } from "@/hooks/useReport";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  if(data === null || data === undefined) return null;
  const [showApprovalOptions, setShowApprovalOptions] = useState(false);
  const [selectedTags, setSelectedTags] = useState<ApprovalTag[]>([]);
  const [imageData, setImageData] = useState<any>(null);
  const [textData, setTextData] = useState<any>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingText, setLoadingText] = useState(false);
  const { toast } = useToast();
  const { getDataDetail } = useData();
  const { manualVerify } = useReport();

  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);

  const hasImage = !!(data.metadata?.dataImgID || data.dataImgID);
  const hasText = !!(data.metadata?.dataTextID || data.dataTextID);
  const hasBoth = hasImage && hasText;

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
      status: {
        Obstacle: false,
        Flooded: false,
        TrafficJam: false,
        Police: false
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
            });
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
            });
          }
        }
      );
    } catch (err) {
      toast({
        title: "Error",
        description: err as any,
        variant: "destructive",
      });
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
        status: {
          Obstacle: false,
          Flooded: false,
          TrafficJam: false,
          Police: false,
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
            });
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
            });
          }
        }
      );
    } catch (err) {
      toast({
        title: "Error",
        description: err as any,
        variant: "destructive",
      });
    }
    resetStates();
    onOpenChange(false);
  };

  useEffect(() => {
    const imgID = data.metadata?.dataImgID || data.dataImgID;
    if (imgID && open) {
      setLoadingImage(true);
      const fetchImageDetail = async () => {
        try {
          const result = await getDataDetail(imgID);
          setImageData(result);
        } catch (error) {
          console.error("Error fetching image detail:", error);
        } finally {
          setLoadingImage(false);
        }
      };
      fetchImageDetail();
    }
  }, [data.metadata?.dataImgID, data.dataImgID, open]);

  useEffect(() => {
    const txtID = data.metadata?.dataTextID || data.dataTextID;
    if (txtID && open) {
      setLoadingText(true);
      const fetchTextDetail = async () => {
        try {
          const result = await getDataDetail(txtID);
          setTextData(result);
        } catch (error) {
          console.error("Error fetching text detail:", error);
        } finally {
          setLoadingText(false);
        }
      };
      fetchTextDetail();
    }
  }, [data.metadata?.dataTextID, data.dataTextID, open]);

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
    setImageData(null);
    setTextData(null);
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
      const date = new Date(dateString);
      return new Date(date.setHours(date.getHours()-7)).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const renderImageContent = () => {
    if (loadingImage) {
      return <div className="text-center py-8 text-muted-foreground">Loading image...</div>;
    }

    if (!imageData?.content) {
      return <div className="text-center py-8 text-muted-foreground">No image available</div>;
    }

    return (
      <div className="rounded-md border overflow-hidden">
        <img
          src={`data:${imageData.image?.contentType || 'image/jpeg'};base64,${imageData.content.content}`}
          alt={data.id}
          className="w-full h-auto max-h-96 object-contain bg-muted"
          data-testid="image-content"
        />
      </div>
    );
  };

  const renderTextContent = () => {
    if (loadingText) {
      return <div className="text-center py-8 text-muted-foreground">Loading text...</div>;
    }

    if (!textData?.content) {
      return <div className="text-center py-8 text-muted-foreground">No text available</div>;
    }

    return (
      <div className="rounded-md bg-muted p-4">
        <pre className="text-sm whitespace-pre-wrap" data-testid="text-content">
          {textData.content.content}
        </pre>
      </div>
    );
  };

  const renderContent = () => {
    if (!hasBoth) {
      if (hasImage) {
        return renderImageContent();
      } else if (hasText) {
        return renderTextContent();
      }
      return <div className="text-center py-8 text-muted-foreground">No content available</div>;
    }

    return (
      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Text
          </TabsTrigger>
        </TabsList>
        <TabsContent value="image" className="mt-4">
          {renderImageContent()}
        </TabsContent>
        <TabsContent value="text" className="mt-4">
          {renderTextContent()}
        </TabsContent>
      </Tabs>
    );
  };

  const detailData = imageData || textData;
  const status = hasImage ? imageData?.status : hasText ? textData?.status : null;

  const renderStatus = (status:any) => {  
    if (!status || !status.statuses) return null;
    const flagConfig = [
      { key: "FloodedFlag", label: "Flooded" },
      { key: "ObstaclesFlag", label: "Obstacles" },
      { key: "PoliceFlag", label: "Police" },
      { key: "TrafficJamFlag", label: "Traffic Jam" },
    ];
  
    return (
      <div className="flex gap-2 mt-1 flex-wrap justify-items-center items-center">
        {flagConfig.map(({ key, label }) =>
          status?.statuses?.[key] ? (
            <Badge key={key} variant="default">
              {label}
            </Badge>
          ) : null
        )}
      </div>
    );
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
                  {hasBoth ? (
                    <>
                      <ImageIcon className="h-4 w-4" />
                      <FileText className="h-4 w-4" />
                      <span>Image & Text Content</span>
                    </>
                  ) : hasImage ? (
                    <>
                      <ImageIcon className="h-4 w-4" />
                      <span>Image Content</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Text Content</span>
                    </>
                  )}
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
                  {data.submittedAt}
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
                  {String(data.metadata?.location || 'N/A')}
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
                  Status
                </label>
                  {renderStatus(status)}
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Qualified
                </label>
                <p className="mt-1 text-sm" data-testid="text-qualified">
                  <Badge variant={data.metadata?.qualified ? "default" : "destructive"}>
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
              <div className="mt-1">
                {renderContent()}
              </div>
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