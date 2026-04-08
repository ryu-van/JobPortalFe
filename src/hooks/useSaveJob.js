import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import jobService from "../services/jobService";

/**
 * useSaveJob — handles save/unsave for a single job.
 *
 * @param {object} opts
 * @param {number|null} opts.savedJobId  - existing saved-job record id (null if not saved)
 * @param {number}      opts.jobId       - the job id
 * @param {function}    opts.onToggle    - callback(newSavedJobId | null) after toggle
 */
export default function useSaveJob({ savedJobId: initialSavedJobId, jobId, onToggle } = {}) {
  const userInfo = useSelector((s) => s.user.userInfo);
  const navigate = useNavigate();
  const [savedJobId, setSavedJobId] = useState(initialSavedJobId ?? null);
  const [loading, setLoading] = useState(false);

  const isSaved = savedJobId !== null;

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
        await jobService.removeJobFromSavedJobs(savedJobId);
        setSavedJobId(null);
        onToggle?.(null);
      } else {
        const res = await jobService.addJobToSavedJobs(jobId, userInfo.id);
        // Backend returns the saved-job record; extract its id
        const newId = res?.id ?? res?.data?.id ?? res ?? null;
        setSavedJobId(newId);
        onToggle?.(newId);
      }
    } catch (err) {
      console.error("Save job error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, loading, toggle, savedJobId };
}
