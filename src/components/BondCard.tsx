"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Tesseract from "tesseract.js";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BondCardProps {
  cardId: string;
  name: string;
  totalBond: number;
  totalWin: number;
  onAddBond: (cardId: string, bondInput: string | string[]) => Promise<void>;
  onEditCard: (cardId: string, newName: string) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
  loading?: boolean;
}

export default function BondCard({
  cardId,
  name,
  totalBond,
  totalWin,
  onAddBond,
  onEditCard,
  onDeleteCard,
  loading,
}: BondCardProps) {
  const [bondInput, setBondInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [previewNumbers, setPreviewNumbers] = useState<{ value: string }[]>([]);
  const [workerReady, setWorkerReady] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const workerRef = useRef<Tesseract.Worker | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [ocrBuffer, setOcrBuffer] = useState<Record<string, number>>({});

  // Convert Bangla digits to English
  const convert = (text: string) => {
    const map: Record<string, string> = {
      "০": "0",
      "১": "1",
      "২": "2",
      "৩": "3",
      "৪": "4",
      "৫": "5",
      "৬": "6",
      "৭": "7",
      "৮": "8",
      "৯": "9",
    };
    return text.replace(/[০-৯]/g, (d) => map[d]);
  };

  const extractNumbers = (text: string) =>
    text
      .replace(/[^\d০-৯]/g, " ")
      .split(/\s+/)
      .map(convert)
      .filter((n) => n.length === 7);

  const analyzeBanglaPrizeBonds = (numbers: string[]) => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    const valid: string[] = [];
    const invalid: string[] = [];

    numbers.forEach((num) => {
      const trimmed = num.trim();
      const isValid = /^\d{7}$/.test(trimmed);

      if (!isValid) invalid.push(trimmed);
      else if (seen.has(trimmed)) duplicates.add(trimmed);
      else {
        seen.add(trimmed);
        valid.push(trimmed);
      }
    });

    return { valid, invalid, duplicates };
  };

  const handleAddBond = async () => {
    const trimmed = bondInput.trim();
    if (!trimmed) return;

    setIsLoading(true);
    await onAddBond(cardId, trimmed);
    setBondInput("");
    setIsLoading(false);
  };

  const handleEditSave = async () => {
    await onEditCard(cardId, editName);
    setIsEditOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteCard(cardId);
    setIsDeleteOpen(false);
  };

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStream(stream);
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Camera access denied or unavailable");
    }
  };
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setOcrBuffer({});
    }
  };

  useEffect(() => {
    const initWorker = async () => {
      const worker = await Tesseract.createWorker("eng");

      await worker.setParameters({
        tessedit_char_whitelist: "0123456789",
      });

      workerRef.current = worker;
      setWorkerReady(true);
    };

    initWorker();

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const scanFrame = async () => {
    if (scanning || !stream || !workerReady) return;
    if (!videoRef.current || !videoRef.current.srcObject) return;
    setScanning(true);

    const video = videoRef.current!;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setScanning(false);
      return;
    }
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = video.videoWidth;
    const h = video.videoHeight;

    const cropW = w * 0.6;
    const cropH = h * 0.3;

    const startX = (w - cropW) / 2;
    const startY = (h - cropH) / 2;

    canvas.width = cropW;
    canvas.height = cropH;

    ctx.filter = "grayscale(1) contrast(2) brightness(1.2)";
    ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, cropW, cropH);

    canvas.toBlob((blob) => {
      if (!blob) {
        setScanning(false);
        return;
      }

      (async () => {
        try {
          const worker = workerRef.current;
          if (!worker) {
            setScanning(false);
            return;
          }

          const result = await worker.recognize(blob);

          if (result.data.confidence < 60) return;

          const numbers = extractNumbers(result.data.text);

          setOcrBuffer((prev) => {
            const updated = { ...prev };
            numbers.forEach((num) => {
              updated[num] = (updated[num] || 0) + 1;
            });
            return updated;
          });
        } catch (err) {
          console.error(err);
        } finally {
          setScanning(false);
        }
      })();
    }, "image/jpeg");
  };
  // Continuous scanning
  useEffect(() => {
    const interval = window.setInterval(scanFrame, 2000);
    return () => clearInterval(interval);
  }, [stream, workerReady]);

  useEffect(() => {
    if (!stream) {
      setScanning(false);
    }
  }, [stream]);

  useEffect(() => {
    const stableNumbers = Object.entries(ocrBuffer)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_num, count]) => count >= 3)
      .map(([num]) => num);

    const newNumbers = stableNumbers
      .filter((n) => !previewNumbers.some((p) => p.value === n))
      .map((n) => ({ value: n }));

    if (newNumbers.length > 0) {
      setPreviewNumbers((prev) => [...prev, ...newNumbers]);
      setIsPreviewOpen(true);
    }
  }, [ocrBuffer]);

  return (
    <div className="relative bg-white rounded-xl border-4 border-black/60 p-6 flex flex-col shadow-2xl mx-auto transition-all duration-300 hover:shadow-[0_20px_30px_rgba(0,0,0,0.3)] hover:-translate-y-2 hover:scale-[1.03] will-change-transform">
      {/* Dropdown Menu */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 rounded hover:bg-gray-200 active:bg-gray-300"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx={5} cy={12} r={2} />
                <circle cx={12} cy={12} r={2} />
                <circle cx={19} cy={12} r={2} />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onSelect={() => setIsDeleteOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="text-2xl font-semibold text-black mb-5">{name}</h3>
      <div className="flex justify-between mb-6 text-gray-700 font-medium">
        <div>
          <p className="uppercase text-xs tracking-widest mb-1">Total Bonds</p>
          <p className="text-lg">{totalBond}</p>
        </div>
        <div>
          <p className="uppercase text-xs tracking-widest mb-1">Total Wins</p>
          <p className="text-lg">{totalWin}</p>
        </div>
      </div>

      {/* Quick Add */}
      <div className="flex gap-3">
        <Input
          ref={inputRef}
          placeholder="Quick add bond #"
          value={bondInput}
          disabled={isLoading}
          onChange={(e) => setBondInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddBond()}
          className="bg-gray-50 border-gray-300 text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black rounded-md"
        />
        <Button
          variant="outline"
          className="border-black text-black hover:bg-black hover:text-white rounded-md"
          onClick={handleAddBond}
          disabled={isLoading}
        >
          Add
        </Button>
      </div>

      {/* Camera */}
      <div className="mt-4 flex flex-col gap-2">
        <video
          ref={videoRef}
          className={`border rounded w-full max-h-60 ${!stream ? "hidden" : ""}`}
          autoPlay
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`/cards/${cardId}`}>
          <Button
            variant="ghost"
            className="w-full bg-black text-white hover:bg-black/60 hover:text-white rounded-md font-semibold"
          >
            Details
          </Button>
        </Link>
        <div className="flex gap-2">
          {stream ? (
            <Button
              onClick={stopCamera}
              className="flex-1 bg-red-600 text-white hover:bg-red-500 rounded-md"
              disabled={!stream}
            >
              Stop Camera
            </Button>
          ) : (
            <Button
              onClick={startCamera}
              className="flex-1 bg-gray-800 text-white hover:bg-gray-700 rounded-md"
              disabled={!!stream}
            >
              Start Camera
            </Button>
          )}
        </div>
      </div>
      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card Name</DialogTitle>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            className="mb-4"
          />
          <DialogFooter>
            <Button
              disabled={loading}
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editName.trim() === ""}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={loading}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={loading} onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[900px] w-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Detected Bonds</DialogTitle>
          </DialogHeader>
          <div className="max-h-60 overflow-auto border p-3 text-sm space-y-2">
            {/* Summary */}
            <div className="text-sm mb-3 space-y-1">
              {(() => {
                const analysis = analyzeBanglaPrizeBonds(
                  previewNumbers.map((p) => p.value),
                );
                return (
                  <>
                    <p>✅ Valid: {analysis.valid.length}</p>
                    <p className="text-yellow-600">
                      ⚠ Duplicates: {analysis.duplicates.size}
                    </p>
                    <p className="text-red-600">
                      ❌ Invalid: {analysis.invalid.length}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Editable numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {previewNumbers
                .map((numObj, index) => ({ ...numObj, index }))
                .reverse()
                .map((numObj, i) => {
                  const { value } = numObj;
                  const numbers = previewNumbers.map((p) => p.value);
                  const analysis = analyzeBanglaPrizeBonds(numbers);

                  const isInvalid = analysis.invalid.includes(value);
                  const isDuplicate = analysis.duplicates.has(value);
                  const isSuspicious = /[19]/.test(value);

                  const handleChange = (newVal: string) => {
                    setPreviewNumbers((prev) =>
                      prev.map((p, idx) =>
                        idx === numObj.index ? { value: newVal } : p,
                      ),
                    );
                  };

                  const handleRemove = () => {
                    setPreviewNumbers(
                      (
                        prev, // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      ) => prev.filter((_, idx) => idx !== numObj.index),
                    );
                  };

                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        className={`px-2 py-1 rounded border flex-1
              ${isInvalid ? "bg-red-100 text-red-700 border-red-300" : ""}
              ${isDuplicate ? "bg-yellow-100 text-yellow-700 border-yellow-300" : ""}
              ${isSuspicious && !isInvalid && !isDuplicate ? "bg-orange-100 text-orange-700 border-orange-300" : ""}
              ${!isInvalid && !isDuplicate && !isSuspicious ? "bg-green-50 text-green-700 border-green-200" : ""}
            `}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleRemove}
                      >
                        x
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPreviewOpen(false);
                setPreviewNumbers([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={stopCamera}
              className="flex-1 bg-red-600 text-white hover:bg-red-500 rounded-md"
              disabled={!stream}
            >
              Stop Camera
            </Button>
            <Button
              disabled={loading}
              onClick={async () => {
                const numbers = previewNumbers.map((p) => p.value.trim());
                const { valid } = analyzeBanglaPrizeBonds(numbers);
                if (valid.length === 0) return;

                setIsLoading(true);
                await onAddBond(cardId, valid);
                setIsLoading(false);

                setPreviewNumbers([]);
                setIsPreviewOpen(false);
              }}
            >
              {loading
                ? "Adding..."
                : `Add ${
                    analyzeBanglaPrizeBonds(previewNumbers.map((p) => p.value))
                      .valid.length
                  } Bonds`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
