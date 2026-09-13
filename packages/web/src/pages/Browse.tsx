import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Creator } from '../types'

export function Browse() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    api.getCreators(search || undefined)
      .then((res) => setCreators(res.creators))
      .catch((err) => console.error('Failed to fetch creators:', err))
      .finally(() => setLoading(false))
  }, [search])

  const formatPrice = (c: Creator) => {
    if (c.price_per_minute) return `$${(c.price_per_minute / 100).toFixed(2)}/min`
    if (c.price_per_hour) return `$${(c.price_per_hour / 100).toFixed(2)}/hr`
    if (c.custom_price) return `$${(c.custom_price / 100).toFixed(2)}`
    return 'Free'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Browse Creators</h1>
          <p className="text-dark-300 mt-1">Find the perfect creator to connect with</p>
        </div>
        <input
          type="text"
          placeholder="Search creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-20 text-dark-400">
          <p className="text-xl mb-2">No creators found</p>
          <p className="text-sm">Try a different search or check back later</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creators.map((creator) => (
            <Link key={creator.id} to={`/creators/${creator.id}`} className="card hover:border-primary/50 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 overflow-hidden">
                  {creator.users?.avatar_url ? (
                    <img src={creator.users.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {(creator.display_name || creator.users?.full_name)?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">
                  {creator.display_name || creator.users?.full_name}
                </h3>
                {creator.bio && <p className="text-dark-300 text-sm mb-3 line-clamp-2">{creator.bio}</p>}
                <div className="flex flex-wrap gap-2 mb-3 justify-center">
                  {(creator.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-dark-700 text-dark-200 text-xs px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-primary font-bold text-lg">{formatPrice(creator)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}