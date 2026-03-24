import { Request, Response } from "express";
import * as mediaService from "../services/media.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getAllMedia = asyncHandler(async (req: Request, res: Response) => {
  const data = await mediaService.getAllMedia();
  res.json(data);
});

export const getMediaDetails = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const data = await mediaService.getMediaDetails(id);

  if (!data) {
    return res.status(404).json({ message: "Media not found" });
  }

  res.json(data);
});