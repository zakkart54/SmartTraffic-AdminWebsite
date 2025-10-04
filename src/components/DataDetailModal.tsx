import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { ImageIcon, FileText, MapPin, Calendar, Clock } from "lucide-react";
  import { useEffect, useState } from "react";
  import { useData } from "@/hooks/useData";
  import { useToast } from "@/hooks/use-toast";
  
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
  
  interface DataDetailModalProps {
    data: ApiDataRecord;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReload: () => void;
  }
  
  type TrainValTestType = "train" | "val" | "test" | null;
  
  export function DataDetailModal({
    data,
    open,
    onOpenChange,
    onReload
  }: DataDetailModalProps) {
    if(data === null || data === undefined) return null;
    
    const [contentData, setContentData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<TrainValTestType>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { toast } = useToast();
    const { getDataDetail, putTrainValTest } = useData();
  
    const isImage = data.type === "image";
    const isText = data.type === "text";
  
    const resetStates = () => {
      setSelectedType(null);
    };

    const handleConfirmOpen = (type: TrainValTestType) => {
      setSelectedType(type);
      setConfirmOpen(true);
    };
  
    const handleClassify = async (type: TrainValTestType) => {
      try {
        await putTrainValTest({
          _id: data._id,
          value: type
        });
        
        toast({
          title: "Success",
          description: `Data đã được phân loại thành ${type?.toUpperCase()}.`,
          color: "green"
        });
        
        resetStates();
        onOpenChange(false);
        onReload();
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Phân loại thất bại",
          variant: "destructive",
          color: "red"
        });
      }
    };
  
    useEffect(() => {
      if (data.InfoID && open) {
        setLoading(true);
        const fetchDetail = async () => {
          try {
            const result = await getDataDetail(data._id);
            setContentData(result);
          } catch (error) {
            console.error("Error fetching data detail:", error);
            toast({
              title: "Error",
              description: "Không thể tải dữ liệu chi tiết",
              variant: "destructive",
              color: "red"
            });
          } finally {
            setLoading(false);
          }
        };
        fetchDetail();
      }
    }, [data.InfoID, open]);
  
    const handleClose = () => {
      setContentData(null);
      setSelectedType(null);
      onOpenChange(false);
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
  
    const getTrainValTestLabel = (value: number) => {
      switch(value) {
        case 1: return "Train";
        case 2: return "Val";
        case 3: return "Test";
        default: return "Unassigned";
      }
    };
  
    const getTrainValTestVariant = (value: number): "default" | "secondary" | "outline" => {
      switch(value) {
        case 1: return "default";
        case 2: return "secondary";
        case 3: return "outline";
        default: return "outline";
      }
    };
  
    const renderContent = () => {
      if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading content...</div>;
      }
  
      if (!contentData?.content) {
        return <div className="text-center py-8 text-muted-foreground">No content available</div>;
      }
  
      if (isImage) {
        return (
          <div className="rounded-md border overflow-hidden">
            <img
              src={`data:${contentData.image?.contentType || 'image/jpeg'};base64,${contentData.content.content}`}
              alt={data._id}
              className="w-full h-auto max-h-96 object-contain bg-muted"
              data-testid="image-content"
            />
          </div>
        );
      }
  
      if (isText) {
        return (
          <div className="rounded-md bg-muted p-4">
            <pre className="text-sm whitespace-pre-wrap" data-testid="text-content">
              {contentData.content.content}
            </pre>
          </div>
        );
      }
  
      return null;
    };
  
    const renderStatus = (status: any) => {  
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
                    {data._id}
                  </DialogTitle>
                  <DialogDescription className="mt-2 flex items-center gap-2">
                    {isImage ? (
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
                  <Badge variant={getTrainValTestVariant(data.TrainValTest)}>
                    {getTrainValTestLabel(data.TrainValTest)}
                  </Badge>
                </div>
              </div>
            </DialogHeader>
    
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Uploader ID
                  </label>
                  <p className="mt-1 text-sm font-mono" data-testid="text-uploader">
                    {data.uploaderID}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Upload Time
                  </label>
                  <p className="mt-1 text-sm font-mono" data-testid="text-upload-time">
                    {formatDate(data.uploadTime)}
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
                    {data.location || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Report ID
                  </label>
                  <p className="mt-1 text-sm font-mono" data-testid="text-report-id">
                    {data.reportID || 'N/A'}
                  </p>
                </div>
              </div>
    
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Processed
                  </label>
                  <p className="mt-1 text-sm" data-testid="text-processed">
                    <Badge variant={data.processed ? "default" : "secondary"}>
                      {data.processed ? "Yes" : "No"}
                    </Badge>
                  </p>
                </div>
                {contentData?.status && (
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </label>
                    {renderStatus(contentData.status)}
                  </div>
                )}
              </div>
    
              {data.processed_time && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Processed Time
                  </label>
                  <p className="mt-1 text-sm font-mono" data-testid="text-processed-time">
                    {formatDate(data.processed_time)}
                  </p>
                </div>
              )}
    
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Content
                </label>
                <div className="mt-1">
                  {renderContent()}
                </div>
              </div>
              
              {(data?.TrainValTest !==1 && data?.TrainValTest !==2 && data?.TrainValTest !==3) ?? (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
                    Put Train/Val/Test
                  </label>
                  <div className="flex gap-3">
                    <Button
                      variant={selectedType === "train" ? "default" : "outline"}
                      onClick={() => handleConfirmOpen("train")}
                      className="flex-1"
                      data-testid="button-train"
                    >
                      Train
                    </Button>
                    <Button
                      variant={selectedType === "val" ? "default" : "outline"}
                      onClick={() => handleConfirmOpen("val")}
                      className="flex-1"
                      data-testid="button-val"
                    >
                      Val
                    </Button>
                    <Button
                      variant={selectedType === "test" ? "default" : "outline"}
                      onClick={() => handleConfirmOpen("test")}
                      className="flex-1"
                      data-testid="button-test"
                    >
                      Test
                    </Button>
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
            <DialogDescription>
              Are you sure you want to put this data in <span className="font-semibold">{selectedType}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="text-white bg-green-600 hover:bg-green-700"
              onClick={() => handleClassify(selectedType)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    );
  }