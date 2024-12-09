import { motion } from 'framer-motion'

export function Shimmer() {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ["0%", "100%"]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
        }}
      />
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 relative">
          <Shimmer />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 relative">
            <Shimmer />
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/6 relative">
            <Shimmer />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 relative">
          <Shimmer />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2 relative">
          <Shimmer />
        </div>
      </div>
    </div>
  )
}