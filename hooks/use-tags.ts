import { useCallback, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from '@/hooks/use-toast'
import { Database } from '@/types/supabase'

export type Tag = {
  id: string
  name: string
  slug: string
  category: string
  emoji?: string
  description?: string
  use_count: number
  is_verified: boolean
}

export type TagSuggestion = {
  id: string
  tag_id: string
  destination_id: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
}

export function useTags() {
  const supabase = useSupabaseClient<Database>()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const getDestinationTags = useCallback(async (destinationId: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('destination_tags')
        .select(`
          *,
          tag:tags(*)
        `)
        .eq('destination_id', destinationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching destination tags:', error)
      toast({
        title: 'Error',
        description: 'Failed to load tags',
        variant: 'destructive',
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  const suggestTag = useCallback(async (
    destinationId: string,
    tagData: Partial<Tag>
  ) => {
    try {
      setIsLoading(true)

      // First create or get the tag
      const { data: tagResult, error: tagError } = await supabase
        .from('tags')
        .select('*')
        .eq('name', tagData.name)
        .single()

      let tagId: string
      if (tagError) {
        // Tag doesn't exist, create it
        const { data: newTag, error: createError } = await supabase
          .from('tags')
          .insert({
            name: tagData.name,
            slug: tagData.name?.toLowerCase().replace(/\s+/g, '-'),
            category: tagData.category || 'general',
            emoji: tagData.emoji,
            description: tagData.description,
          })
          .select()
          .single()

        if (createError) throw createError
        tagId = newTag.id
      } else {
        tagId = tagResult.id
      }

      // Create the tag suggestion
      const { error: suggestionError } = await supabase
        .from('user_suggested_tags')
        .insert({
          tag_id: tagId,
          destination_id: destinationId,
        })

      if (suggestionError) throw suggestionError

      toast({
        title: 'Success',
        description: 'Tag suggestion submitted for review',
      })

      return true
    } catch (error) {
      console.error('Error suggesting tag:', error)
      toast({
        title: 'Error',
        description: 'Failed to suggest tag',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  const voteOnTag = useCallback(async (
    destinationId: string,
    tagId: string,
    isUpvote: boolean
  ) => {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from('destination_tags')
        .update({
          votes_up: isUpvote ? supabase.rpc('increment_counter', { column: 'votes_up' }) : undefined,
          votes_down: !isUpvote ? supabase.rpc('increment_counter', { column: 'votes_down' }) : undefined,
        })
        .eq('destination_id', destinationId)
        .eq('tag_id', tagId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error voting on tag:', error)
      toast({
        title: 'Error',
        description: 'Failed to record vote',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  const getUserInterests = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('user_interests')
        .select(`
          *,
          tag:tags(*)
        `)
        .order('strength', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user interests:', error)
      toast({
        title: 'Error',
        description: 'Failed to load interests',
        variant: 'destructive',
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  const updateUserInterest = useCallback(async (
    tagId: string,
    strength: number
  ) => {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from('user_interests')
        .upsert({
          tag_id: tagId,
          strength,
        })

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error updating interest:', error)
      toast({
        title: 'Error',
        description: 'Failed to update interest',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  const getTags = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('use_count', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tags:', error)
      toast({
        title: 'Error',
        description: 'Failed to load tags',
        variant: 'destructive',
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  return {
    isLoading,
    getDestinationTags,
    suggestTag,
    voteOnTag,
    getUserInterests,
    updateUserInterest,
    getTags,
  }
} 