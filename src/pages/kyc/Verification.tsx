import React, { useState, useEffect, useRef } from "react";
import {
  BadgeCheck,
  FileText,
  UploadCloud,
  Camera,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import {
  getKycStatus,
  submitLevelOne,
  submitLevelTwo,
  submitLevelThree,
  KycStatusResponse,
} from "@/api/kyc";

export const Verification: React.FC = () => {
  const { push } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [kycData, setKycData] = useState<KycStatusResponse["data"] | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Level 1 State
  const [idType, setIdType] = useState<string>("passport");
  const [idNumber, setIdNumber] = useState<string>("");
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);

  // Level 2 State
  const [addressType, setAddressType] = useState<string>("utility_bill");
  const [utilityBillType, setUtilityBillType] = useState<string>("Electricity");
  const [addressFile, setAddressFile] = useState<File | null>(null);

  // Level 3 State (Liveness Camera)
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [livenessBlob, setLivenessBlob] = useState<Blob | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchKycData();
  }, []);

  const fetchKycData = async () => {
    try {
      setLoading(true);
      const res = await getKycStatus();
      if (res.status && res.data) {
        setKycData(res.data);
        determineActiveStep(res.data);
      }
    } catch (error: any) {
      push("Failed to load KYC verification data", "error");
    } finally {
      setLoading(false);
    }
  };

  const determineActiveStep = (data: KycStatusResponse["data"]) => {
    if (data.level_1_status !== "approved") {
      setActiveStep(1);
    } else if (data.level_2_status !== "approved") {
      setActiveStep(2);
    } else if (data.level_3_status !== "approved") {
      setActiveStep(3);
    } else {
      setActiveStep(4); // Fully Verified
    }
  };

  // --- Camera Operations for Level 3 ---
  const startCamera = async () => {
    try {
      setCameraActive(true);
      setCapturedSelfie(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      push("Unable to access camera. Please allow camera permissions.", "error");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedSelfie(dataUrl);

        canvas.toBlob((blob) => {
          if (blob) setLivenessBlob(blob);
        }, "image/jpeg", 0.9);

        stopCamera();
      }
    }
  };

  // --- Form Submissions ---
  const handleLevelOneSubmit = async () => {
    if (!idNumber) return push("Please enter your ID number", "error");
    if (!idFrontFile) return push("Please upload the front of your ID card", "error");

    const formData = new FormData();
    formData.append("id_type", idType);
    formData.append("id_number", idNumber);
    formData.append("id_card_front", idFrontFile);
    if (idBackFile) formData.append("id_card_back", idBackFile);

    try {
      setSubmitting(true);
      const res = await submitLevelOne(formData);
      push(res.message || "Level 1 details submitted!", "success");
      await fetchKycData();
    } catch (err: any) {
      push(err?.response?.data?.message || "Level 1 submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLevelTwoSubmit = async () => {
    if (!addressFile) return push("Please upload your proof of address document", "error");

    const formData = new FormData();
    formData.append("address_type", addressType);
    formData.append("utility_bill_type", utilityBillType);
    formData.append("address_document", addressFile);

    try {
      setSubmitting(true);
      const res = await submitLevelTwo(formData);
      push(res.message || "Level 2 details submitted!", "success");
      await fetchKycData();
    } catch (err: any) {
      push(err?.response?.data?.message || "Level 2 submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLevelThreeSubmit = async () => {
    if (!livenessBlob) return push("Please capture a live photo first", "error");

    const file = new File([livenessBlob], "liveness_snapshot.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("liveness_photo", file);

    try {
      setSubmitting(true);
      const res = await submitLevelThree(formData);
      push(res.message || "Liveness photo submitted successfully!", "success");
      await fetchKycData();
    } catch (err: any) {
      push(err?.response?.data?.message || "Liveness check submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { level: 1, title: "Government ID Upload", status: kycData?.level_1_status || "not_submitted" },
    { level: 2, title: "Proof of Address", status: kycData?.level_2_status || "not_submitted" },
    { level: 3, title: "Liveness Check", status: kycData?.level_3_status || "not_submitted" },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Left Main Form Box */}
      <div className="card lg:col-span-2">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-state-successbg text-state-success">
            <BadgeCheck size={18} />
          </span>
          <div>
            <h3 className="font-bold text-ink-900">Identity Verification</h3>
            <p className="text-xs text-ink-900/50">Complete KYC to unlock higher transfer limits.</p>
          </div>
        </div>

        {/* Step Progression Indicators */}
        <div className="mb-6 space-y-3">
          {stepsList.map((s) => {
            const isApproved = s.status === "approved";
            const isPending = s.status === "pending";
            const isRejected = s.status === "rejected";
            const isActive = activeStep === s.level;

            return (
              <div
                key={s.level}
                onClick={() => {
                  if (s.level <= (kycData?.current_level || 0) + 1) {
                    setActiveStep(s.level);
                  }
                }}
                className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-surface-border"
                } ${s.level <= (kycData?.current_level || 0) + 1 ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      isApproved
                        ? "bg-state-success text-white"
                        : isPending
                        ? "bg-amber-500 text-white"
                        : isRejected
                        ? "bg-state-error text-white"
                        : isActive
                        ? "bg-primary text-white"
                        : "bg-surface-muted text-ink-900/50"
                    }`}
                  >
                    {isApproved ? "✓" : s.level}
                  </span>
                  <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-ink-900"}`}>
                    Level {s.level}: {s.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isApproved && (
                    <span className="pill bg-state-successbg text-state-success text-[10px]">Approved</span>
                  )}
                  {isPending && (
                    <span className="pill bg-amber-500/10 text-amber-600 text-[10px]">Under Review</span>
                  )}
                  {isRejected && (
                    <span className="pill bg-state-errorbg text-state-error text-[10px]">Rejected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- STEP 1: GOVERNMENT ID --- */}
        {activeStep === 1 && (
          <div className="space-y-4 rounded-xl border border-surface-border p-5">
            <h4 className="font-semibold text-ink-900">Level 1: Government ID Document</h4>
            
            {kycData?.level_1_status === "approved" ? (
              <div className="rounded-lg bg-state-successbg p-4 text-xs text-state-success font-semibold">
                ✓ Level 1 verification has been approved!
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-ink-900/70">ID Type</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="input-field mt-1 w-full"
                    >
                      <option value="passport">International Passport</option>
                      <option value="national_id">National ID Card</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="voters_card">Voter's Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink-900/70">ID Number</label>
                    <input
                      type="text"
                      placeholder="e.g. A00123456"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="input-field mt-1 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border-2 border-dashed border-surface-border p-4 text-center">
                    <UploadCloud size={24} className="mx-auto mb-2 text-ink-900/40" />
                    <p className="text-xs font-semibold text-ink-900">Front of ID Document</p>
                    <label className="btn-secondary mt-2 inline-flex cursor-pointer text-xs">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setIdFrontFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {idFrontFile && <p className="mt-2 text-[11px] text-ink-900/70 truncate">{idFrontFile.name}</p>}
                  </div>

                  <div className="rounded-xl border-2 border-dashed border-surface-border p-4 text-center">
                    <UploadCloud size={24} className="mx-auto mb-2 text-ink-900/40" />
                    <p className="text-xs font-semibold text-ink-900">Back of ID Document (Optional)</p>
                    <label className="btn-secondary mt-2 inline-flex cursor-pointer text-xs">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setIdBackFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {idBackFile && <p className="mt-2 text-[11px] text-ink-900/70 truncate">{idBackFile.name}</p>}
                  </div>
                </div>

                <button
                  disabled={submitting || kycData?.level_1_status === "pending"}
                  onClick={handleLevelOneSubmit}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {kycData?.level_1_status === "pending" ? "Level 1 Under Review" : "Submit Level 1 ID"}
                </button>
              </>
            )}
          </div>
        )}

        {/* --- STEP 2: PROOF OF ADDRESS --- */}
        {activeStep === 2 && (
          <div className="space-y-4 rounded-xl border border-surface-border p-5">
            <h4 className="font-semibold text-ink-900">Level 2: Proof of Address Document</h4>

            {kycData?.level_1_status !== "approved" ? (
              <div className="rounded-lg bg-amber-500/10 p-4 text-xs text-amber-700 flex items-center gap-2">
                <ShieldAlert size={16} /> Complete and obtain approval for Level 1 before proceeding to Level 2.
              </div>
            ) : kycData?.level_2_status === "approved" ? (
              <div className="rounded-lg bg-state-successbg p-4 text-xs text-state-success font-semibold">
                ✓ Level 2 proof of address has been approved!
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-ink-900/70">Document Type</label>
                    <select
                      value={addressType}
                      onChange={(e) => setAddressType(e.target.value)}
                      className="input-field mt-1 w-full"
                    >
                      <option value="utility_bill">Utility Bill</option>
                      <option value="bank_statement">Bank Statement</option>
                      <option value="tenancy_agreement">Tenancy Agreement</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink-900/70">Bill / Statement Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Electricity, Water, Bank Name"
                      value={utilityBillType}
                      onChange={(e) => setUtilityBillType(e.target.value)}
                      className="input-field mt-1 w-full"
                    />
                  </div>
                </div>

                <div className="rounded-xl border-2 border-dashed border-surface-border p-6 text-center">
                  <UploadCloud size={28} className="mx-auto mb-2 text-ink-900/40" />
                  <p className="text-xs font-semibold text-ink-900">Upload Document File (PDF or Image)</p>
                  <p className="text-[11px] text-ink-900/50 mt-1 mb-3">Issued within the last 3 months</p>
                  <label className="btn-secondary inline-flex cursor-pointer text-xs">
                    <FileText size={14} className="mr-1" /> Choose File
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setAddressFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {addressFile && <p className="mt-2 text-xs font-semibold text-ink-900">{addressFile.name}</p>}
                </div>

                <button
                  disabled={submitting || kycData?.level_2_status === "pending"}
                  onClick={handleLevelTwoSubmit}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {kycData?.level_2_status === "pending" ? "Level 2 Under Review" : "Submit Proof of Address"}
                </button>
              </>
            )}
          </div>
        )}

        {/* --- STEP 3: LIVENESS CHECK (SYSTEM CAMERA) --- */}
        {activeStep === 3 && (
          <div className="space-y-4 rounded-xl border border-surface-border p-5">
            <h4 className="font-semibold text-ink-900">Level 3: Liveness Check Snapshot</h4>

            {kycData?.level_2_status !== "approved" ? (
              <div className="rounded-lg bg-amber-500/10 p-4 text-xs text-amber-700 flex items-center gap-2">
                <ShieldAlert size={16} /> Complete and obtain approval for Level 2 before completing the Liveness Check.
              </div>
            ) : kycData?.level_3_status === "approved" ? (
              <div className="rounded-lg bg-state-successbg p-4 text-xs text-state-success font-semibold">
                ✓ Level 3 Liveness check has been approved!
              </div>
            ) : (
              <>
                <p className="text-xs text-ink-900/60">
                  Please align your face in the camera view below and snap a clear photo.
                </p>

                <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-black min-h-[260px]">
                  {/* Realtime Video Stream */}
                  {cameraActive && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="h-64 w-full object-cover"
                    />
                  )}

                  {/* Canvas for snapshot generation */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Captured Photo Preview */}
                  {capturedSelfie && !cameraActive && (
                    <img
                      src={capturedSelfie}
                      alt="Selfie snapshot"
                      className="h-64 w-full object-cover"
                    />
                  )}

                  {!cameraActive && !capturedSelfie && (
                    <div className="text-center p-6 text-white/70">
                      <Camera size={36} className="mx-auto mb-2 text-white/50" />
                      <p className="text-xs">Camera is offline</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!cameraActive && !capturedSelfie && (
                    <button onClick={startCamera} className="btn-secondary w-full flex items-center justify-center gap-2">
                      <Camera size={16} /> Open Camera
                    </button>
                  )}

                  {cameraActive && (
                    <button onClick={capturePhoto} className="btn-primary w-full flex items-center justify-center gap-2">
                      <Camera size={16} /> Snap Photo
                    </button>
                  )}

                  {capturedSelfie && !cameraActive && (
                    <button onClick={startCamera} className="btn-secondary w-full flex items-center justify-center gap-2">
                      <RefreshCw size={16} /> Retake Snapshot
                    </button>
                  )}
                </div>

                <button
                  disabled={submitting || !capturedSelfie || kycData?.level_3_status === "pending"}
                  onClick={handleLevelThreeSubmit}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {kycData?.level_3_status === "pending" ? "Level 3 Under Review" : "Submit Liveness Check"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Verification Overview Card */}
      <div className="card h-fit">
        <h3 className="mb-3 font-bold text-ink-900">Verification Status</h3>

        <div
          className={`rounded-xl p-4 ${
            kycData?.current_level === 3
              ? "bg-state-successbg text-state-success"
              : kycData?.current_level === 2
              ? "bg-blue-500/10 text-blue-600"
              : kycData?.current_level === 1
              ? "bg-amber-500/10 text-amber-600"
              : "bg-surface-muted text-ink-900/70"
          }`}
        >
          <p className="text-sm font-bold">Tier {kycData?.current_level || 0} Verified</p>
          <p className="mt-1 text-xs opacity-80">
            {kycData?.current_level === 3
              ? "Daily transfer limit: Unlimited"
              : kycData?.current_level === 2
              ? "Daily transfer limit: ₦200,000,000"
              : kycData?.current_level === 1
              ? "Daily transfer limit: ₦5,000,000"
              : "Daily transfer limit: ₦50,000"}
          </p>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex justify-between border-b border-surface-border pb-2">
            <span className="text-ink-900/50">Overall Status</span>
            <span className="font-semibold capitalize text-ink-900">{kycData?.status || "Pending"}</span>
          </div>
          <div className="flex justify-between border-b border-surface-border pb-2">
            <span className="text-ink-900/50">Level 1 (ID)</span>
            <span className="font-semibold capitalize text-ink-900">{kycData?.level_1_status || "Not Submitted"}</span>
          </div>
          <div className="flex justify-between border-b border-surface-border pb-2">
            <span className="text-ink-900/50">Level 2 (Address)</span>
            <span className="font-semibold capitalize text-ink-900">{kycData?.level_2_status || "Not Submitted"}</span>
          </div>
          <div className="flex justify-between border-b border-surface-border pb-2">
            <span className="text-ink-900/50">Level 3 (Liveness)</span>
            <span className="font-semibold capitalize text-ink-900">{kycData?.level_3_status || "Not Submitted"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};