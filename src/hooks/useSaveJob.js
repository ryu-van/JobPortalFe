import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import jobService from "../services/jobService";


export default function useSaveJob({ savedJobId: initialSavedJobId, jobId, onToggle } = {}) {
  const userInfo = useSelector((s) => s.user.userInfo);
  const navigate = useNavigate();
  const [savedJobId, setSavedJobId] = useState(initialSavedJobId ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSavedJobId !== undefined) {
      setSavedJobId(initialSavedJobId ?? null);
    }
  }, [initialSavedJobId]);

  const isSaved = savedJobId !== null;
  const canUnsave = savedJobId !== null;

  const toggle = async (e) => {
    e?.stopPropagation();

    if (!userInfo) {
      navigate("/login");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isSaved) {
        if (!canUnsave) {
          return;
        }
        await jobService.removeJobFromSavedJobs(savedJobId);
        setSavedJobId(null);
        onToggle?.(null);
      } else {
        const response = await jobService.addJobToSavedJobs(jobId);
        const newSavedJobId = response?.savedJobId ?? response?.data?.savedJobId ?? null;
        setSavedJobId(newSavedJobId);
        onToggle?.(newSavedJobId);
      }
    } catch (err) {
      console.error("Save job error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, loading, toggle, savedJobId, canUnsave };
}
