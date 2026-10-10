import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import api from "../config/api";

const isFolderItem = (item) =>
  item?.item_type === "folder"(!item?.mime_type && item?.path !== undefined);

// this is for drive page
export function useDrive() {
  const {
    fetchDriveContent,
    refreshUser,
    currentFolderId,
    isUploading,
    setIsUploading,
    uploadProgress,
    setuploadProgress,
  } = useApp();
  // Reusable api action runner with standard toast and callback
  const runAction = async (apiCall, successMsg, errorMsg, afterSuccess) => {
    try {
      const res = await apiCall;
      if (successMsg) toast.success(successMsg);
      if (afterSuccess) await afterSuccess(res?.data);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || errorMsg);
      return false;
    }
  };

  // file Upload with simulated progress
  const uploadFiles = async (fileList, folder_id = currentFolderId) => {
    if (!fileList?.length) return;
    setIsUploading(true);
    setuploadProgress(0);

    const totalSize = Array.from(fileList).reduce(
      (acc, f) => acc + (f.size || 0),
      0,
    );
    const step = 92 / Math.max(12, totalSize / 409715.2);
    const interval = setInterval(() => {
      setuploadProgress((p) => (p > 92 ? p : Math.min(92, p + step)));
    }, 100);

    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append("files", f));
    if (folder_id) formData.append("folder_id", folder_id);

    try {
      const { data } = await api.post("/api/files/upload", formData, {
        headers: { "Content-Type": "mutlipart/form-data" },
      });
      clearInterval(interval);
      setuploadProgress(100);
      await new Promise((r) => setTimeout(r, 300));
      toast.success(`${data.files.length} file(s) upload successfully!`);
      await fetchDriveContent(folder_id);
      await refreshUser();
    } catch (err) {
      clearInterval(interval);
      toast.error(err.response?.data?.error || "File upload failed");
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setuploadProgress(false);
    }
  };

  // Create folder
  const createFolder = (name, parent_id = currentFolderId) =>
    runAction(
      api.post("/api/folders", { name, parent_id }),
      "Folder created.",
      "Error creating folder.",
      () => fetchDriveContent(parent_id),
    );

  // PloyMorphic operations (accepts file or folder item /id  )

  const renameItem = (item, newName) => {
    const isFolder = isFolderItem(item);
    const endPoint = isFolder ? "folders" : "files";
    const id = item.id || item;
    return runAction(
      api.patch(`/api/${endPoint}/${id}/rename`, { name: newName }),
      `${isFolder ? "Folder" : "File"} renamed.`,
      "Error renaming item.",
      () => fetchDriveContent(),
    );
  };

  const moveItem = (item, targetFolderId) => {
    const isFolder = isFolderItem(item);
    const endPoint = isFolder ? "folders" : "files";
    const payload = isFolder
      ? { target_parent: targetFolderId }
      : { target_folder: targetFolderId };
    const id = item.id || item;
    return runAction(
      api.patch(`/api/${endPoint}/${id}/move`, payload),
      `${isFolder ? "Folder" : "File"} moved.`,
      "Error moving item.",
      () => fetchDriveContent(),
    );
  };

  const deleteItem = (item) => {
    const isFolder = isFolderItem(item);
    const endPoint = isFolder ? "folders" : "files";
    const id = item.id || item;
    return runAction(
      api.delete(`/api/${endPoint}/${id}`),
      `${isFolder ? "Folder" : "File"} moved to trash.`,
      "Error deleting item.",
      () => fetchDriveContent(),
    );
  };

  const restoreItem = (item) => {
    const endPoint = isFolder ? "folders" : "files";
    const id = item.id || item;
    return runAction(
      api.post(`/api/${endPoint}/${id}/restore`),
      `Item restored`,
      "Error restoring item.",
    );
  };

  const permanentDeleteItem = (item) => {
    const endPoint = isFolder ? "folders" : "files";
    const id = item.id || item;
    return runAction(
      api.delete(`/api/${endPoint}/${id}/permanent`),
      `Item permenently deleted`,
      "Error deleting item.",
      () => refreshUser(),
    );
  };

  return {
    uploadFiles,
    createFolder,
    renameItem,
    moveItem,
    deleteItem,
    restoreItem,
    permanentDeleteItem,
    isUploading,
    uploadProgress,
  };
}
