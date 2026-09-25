// One-off seed script to populate the feed with sample videos.
// Run locally with the same env you use in production:
//   node seed.js
// Requires MONGODB_URI in the environment (or a local .env).
import "dotenv/config";
import mongoose from "mongoose";
import { DB_NAME } from "./src/constants.js";
import { User } from "./src/models/user.models.js";
import { Video } from "./src/models/video.models.js";

const TV = "https://test-videos.co.uk/vids";
const W3 = "https://media.w3.org/2010/05";

const SAMPLES = [
  {
    key: "SintelTrailer",
    title: "Sintel (Official Trailer)",
    description:
      "A lonely young woman searches for a baby dragon she befriended. A Blender Foundation short film.",
    url: `${W3}/sintel/trailer.mp4`,
    duration: 52,
    views: 254300,
  },
  {
    key: "BigBuckBunny",
    title: "Big Buck Bunny",
    description:
      "A large and lovable rabbit deals with three tiny bullies in this classic open-source animated short.",
    url: `${W3}/bunny/movie.mp4`,
    duration: 60,
    views: 512000,
  },
  {
    key: "BigBuckBunnyTrailer",
    title: "Big Buck Bunny (Trailer)",
    description: "The official trailer for the Blender Foundation's Big Buck Bunny.",
    url: `${W3}/bunny/trailer.mp4`,
    duration: 33,
    views: 128400,
  },
  {
    key: "ShortFilm",
    title: "A Short Film",
    description: "A short sample film clip used for demoing HTML5 video playback.",
    url: `${W3}/video/movie_300.mp4`,
    duration: 28,
    views: 41200,
  },
  {
    key: "Jellyfish720",
    title: "Jellyfish Aquarium",
    description: "Relaxing footage of jellyfish drifting through an aquarium tank.",
    url: `${TV}/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4`,
    duration: 10,
    views: 87400,
  },
  {
    key: "BBB1080",
    title: "Big Buck Bunny in 1080p",
    description: "A crisp 1080p clip of Big Buck Bunny.",
    url: `${TV}/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_2MB.mp4`,
    duration: 10,
    views: 62100,
  },
  {
    key: "BBB360",
    title: "Big Buck Bunny in 360p",
    description: "A lightweight 360p clip of Big Buck Bunny for slower connections.",
    url: `${TV}/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4`,
    duration: 10,
    views: 30500,
  },
  {
    key: "BBB720",
    title: "Big Buck Bunny in HD",
    description: "A 720p HD clip of Big Buck Bunny.",
    url: `${TV}/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4`,
    duration: 10,
    views: 51700,
  },
];

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  console.log("Connected to DB:", mongoose.connection.host);

  // Ensure a demo channel user owns the seeded videos.
  let channel = await User.findOne({ username: "vidtube" });
  if (!channel) {
    channel = await User.create({
      username: "vidtube",
      email: "channel@vidtube.demo",
      fullname: "VidTube Studios",
      avatar:
        "https://api.dicebear.com/7.x/initials/svg?seed=VidTube&backgroundColor=ff2d55",
      coverImage: "",
      password: "VidTubeDemo123",
    });
    console.log("Created demo channel user:", channel.username);
  } else {
    console.log("Using existing channel user:", channel.username);
  }

  // Clear previously seeded videos owned by the demo channel, then reinsert.
  await Video.deleteMany({ owner: channel._id });

  const docs = SAMPLES.map((s) => ({
    title: s.title,
    description: s.description,
    videoFile: s.url,
    thumbnail: `https://picsum.photos/seed/${s.key}/640/360`,
    duration: s.duration,
    views: s.views,
    isPublished: true,
    owner: channel._id,
  }));

  const inserted = await Video.insertMany(docs);
  console.log(`Seeded ${inserted.length} videos.`);

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
