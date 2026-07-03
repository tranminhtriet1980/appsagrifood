'use client';

// Bọc face-api.js cho phía trình duyệt: tải model, trích xuất & so khớp khuôn mặt.
import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

const MODEL_URL = '/models';

// Tải model 1 lần (idempotent)
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

export function areModelsLoaded() {
  return modelsLoaded;
}

// Trích xuất face descriptor (128 số) từ khung hình video. Null nếu không thấy mặt.
export async function getDescriptorFromMedia(
  media: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  const result = await faceapi
    .detectSingleFace(
      media,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();
  return result?.descriptor ?? null;
}

// Khoảng cách Euclidean giữa 2 descriptor (0 = giống hệt; càng nhỏ càng giống)
export function faceDistance(
  a: number[] | Float32Array,
  b: number[] | Float32Array
): number {
  return faceapi.euclideanDistance(Array.from(a), Array.from(b));
}
