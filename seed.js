// One-off seed script to populate the feed with sample videos.
// Run locally with the same env you use in production:
//   node seed.js
// Requires MONGODB_URI in the environment (or a local .env).
import "dotenv/config";
import mongoose from "mongoose";
import { DB_NAME } from "./src/constants.js";
import { User } from "./src/models/user.models.js";
import { Video } from "./src/models/video.models.js";

const G = "https://storage.googleapis.com/gtv-videos-bucket/sample";

const SAMPLES = [
  {
    key: "BigBuckBunny",
    title: "Big Buck Bunny",
    description:
      "A large and lovable rabbit deals with three tiny bullies in this classic open-source animated short.",
    duration: 596,
    views: 128000,
  },
  {
    key: "ElephantsDream",
    title: "Elephant's Dream",
    description:
      "The first Blender Open Movie: two characters explore a strange mechanical world.",
    duration: 653,
    views: 87400,
  },
  {
    key: "Sintel",
    title: "Sintel",
    description:
      "A lonely young woman searches for a baby dragon she befriended. A Blender Foundation short film.",
    duration: 888,
    views: 254300,
  },
  {
    key: "TearsOfSteel",
    title: "Tears of Steel",
    description:
      "A sci-fi short about a group trying to save the world from destructive robots.",
    duration: 734,
    views: 96200,
  },
  {
    key: "ForBiggerBlazes",
    title: "For Bigger Blazes",
    description: "Chromecast promo clip. Cast your favorite entertainment to your TV.",
    duration: 15,
    views: 30500,
  },
  {
    key: "ForBiggerEscapes",
    title: "For Bigger Escapes",
    description: "Introducing Chromecast. The easiest way to enjoy online video on your TV.",
    duration: 15,
    views: 21800,
  },
  {
    key: "ForBiggerFun",
    title: "For Bigger Fun",
    description: "Cast games, apps and movies to your TV with Chromecast.",
    duration: 60,
    views: 41200,
  },
  {
    key: "ForBiggerJoyrides",
    title: "For Bigger Joyrides",
    description: "Chromecast. For bigger joyrides on the big screen.",
    duration: 15,
    views: 18900,
  },
  {
    key: "SubaruOutbackOnStreetAndDirt",
    title: "Subaru Outback On Street And Dirt",
    description: "A short review of the Subaru Outback, on the street and off-road.",
    duration: 594,
    views: 62100,
  },
  {
    key: "VolkswagenGTIReview",
    title: "Volkswagen GTI Review",
    description: "A quick review of the Volkswagen GTI hot hatch.",
    duration: 588,
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
    videoFile: `${G}/${s.key}.mp4`,
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
