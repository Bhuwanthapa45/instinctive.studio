// app/api/cameras/route.ts
export async function GET() {
  const cameraFeeds = [
    {
      id: 0,
      label: 'Main View',
      src: '/camera-main.mp4',
      timestamp: '2025-07-23 10:35:12',
    },
    {
      id: 1,
      label: 'Camera -01',
      src: '/camera-1.mp4',
      timestamp: '2025-07-23 10:34:59',
    },
    {
      id: 2,
      label: 'Camera -02',
      src: '/camera-2.mp4',
      timestamp: '2025-07-23 10:35:00',
    },
    {
      id: 3,
      label: 'Camera -03',
      src: '/Users/bhuwanthapa/Desktop/instinctiveStudio/secure-sight-dashboard/public/images/thumb1.jpg',
      timestamp: '2025-07-23 10:35:05',
    },
  ];
  return Response.json(cameraFeeds);
}
