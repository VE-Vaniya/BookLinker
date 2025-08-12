import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

function TiltCard({ title, description }) {
  const x = useMotionValue(160);
  const y = useMotionValue(110);
  const rotateX = useTransform(y, [0, 220], [20, -20]);
  const rotateY = useTransform(x, [0, 320], [-20, 20]);

  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - bounds.left);
    y.set(e.clientY - bounds.top);
  };

  const handleMouseLeave = () => {
    x.set(160);
    y.set(110);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 text-white cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl w-[320px] h-[220px] flex flex-col justify-center items-center border border-white/20"
    >
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl font-semibold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#f8d8b8] via-[#d4a373] to-[#ffffff]"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-sm text-center text-white/80"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

const features = [
  {
    title: "📦 Sell Books Easily",
    description:
      "List your books in minutes and reach passionate readers looking to buy.",
  },
  {
    title: "🎁 Donate With Purpose",
    description:
      "Give your stories a second life by donating to eager minds and schools.",
  },
  {
    title: "🔄 Book Exchange",
    description: "Swap titles with fellow readers and keep your shelves fresh.",
  },
  {
    title: "📖 Borrow from Locals",
    description:
      "Borrow books from nearby readers and return them when you're done.",
  },
  {
    title: "🤝 Lend What You Love",
    description:
      "Share your favorite reads with friends, neighbors, or community groups.",
  },
  {
    title: "🛒 Buy at Great Prices",
    description:
      "Find new, used, or rare books from trusted sellers at affordable rates.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-[#1a1a1a] via-[#2f1b0c] to-[#4b2e2e] overflow-hidden text-white font-serif">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none animate-pulse" />

      <div className="relative z-10 text-center px-6 pt-32 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#f8d8b8] via-[#d4a373] to-[#ffffff] bg-clip-text text-transparent animate-text-shimmer"
        >
          BookLinker: One Platform, Every Book Journey
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg max-w-2xl mx-auto mt-6 text-[#e7d6c2]"
        >
          Whether you're giving books a new home, searching for rare reads, or
          connecting with fellow readers — BookLinker is your trusted companion
          in every chapter of your book journey.
        </motion.p>

        <Link to="/login">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 bg-[#d4a373] text-[#4b2e2e] px-8 py-4 rounded-full shadow-md text-lg font-medium hover:bg-[#c88a52] transition"
          >
            Get Started
          </motion.button>
        </Link>
      </div>

      <div className="relative text-center px-6 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-4xl font-bold text-[#e7d6c2]"
        >
          "Transform Your Book Journey"
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="text-lg max-w-2xl mx-auto mt-4 text-[#e7d6c2]"
        >
          Join a community of passionate readers and sellers. With BookLinker,
          your next great read is just a click away.
        </motion.p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
        className="z-10 relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-6 md:px-20 pb-32"
      >
        {features.map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: idx * 0.2 }}
            className="flex justify-center"
          >
            <TiltCard title={feat.title} description={feat.description} />
          </motion.div>
        ))}
      </motion.div>

      <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-[#1a1a1a] to-transparent" />
    </div>
  );
}
