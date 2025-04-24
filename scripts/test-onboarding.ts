import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Database } from '@/types/supabase'

dotenv.config({ path: '.env.local' })

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper to ensure consistent parameter order and null defaults
function createOnboardingPayload(userId: string, updates: Partial<{
  p_first_name: string,
  p_travel_personality: string,
  p_travel_squad: string,
  p_onboarding_step: number,
  p_complete_onboarding: boolean
}>) {
  return {
    p_user_id: userId,
    p_first_name: updates.p_first_name ?? null,
    p_travel_personality: updates.p_travel_personality ?? null,
    p_travel_squad: updates.p_travel_squad ?? null,
    p_onboarding_step: updates.p_onboarding_step ?? null,
    p_complete_onboarding: updates.p_complete_onboarding ?? false,
  }
}

async function testOnboardingFlow() {
  let userId: string | null = null
  try {
    console.log('🧪 Testing onboarding flow...\n')

    // 1. Create a test user
    console.log('1️⃣ Creating test user...')
    const email = `test-user-${Date.now()}@example.com`
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: 'test-password123',
      email_confirm: true
    })

    if (userError) throw userError
    userId = userData.user.id
    console.log('✅ Test user created:', userId)

    // 2. Update basic info
    console.log('\n2️⃣ Updating basic info...')
    const basicInfoPayload = createOnboardingPayload(userId, {
      p_first_name: 'Test User',
      p_onboarding_step: 2
    })
    const { data: basicInfo, error: basicError } = await supabase.rpc(
      'update_profile_onboarding',
      basicInfoPayload
    )

    if (basicError) throw basicError
    console.log('✅ Basic info updated:', basicInfo)

    // 3. Set travel personality
    console.log('\n3️⃣ Setting travel personality...')
    const personalityPayload = createOnboardingPayload(userId, {
      p_travel_personality: 'adventurer',
      p_onboarding_step: 3
    })
    const { data: personalityInfo, error: personalityError } = await supabase.rpc(
      'update_profile_onboarding',
      personalityPayload
    )

    if (personalityError) throw personalityError
    console.log('✅ Travel personality set:', personalityInfo)

    // 4. Set travel squad
    console.log('\n4️⃣ Setting travel squad...')
    const squadPayload = createOnboardingPayload(userId, {
      p_travel_squad: 'friends',
      p_onboarding_step: 4
    })
    const { data: squadInfo, error: squadError } = await supabase.rpc(
      'update_profile_onboarding',
      squadPayload
    )

    if (squadError) throw squadError
    console.log('✅ Travel squad set:', squadInfo)

    // 5. Set interests
    console.log('\n5️⃣ Setting interests...')
    // Assuming tags like 'outdoor-activities', 'hiking', 'local-experiences' exist in the tags table
    // We need to get their UUIDs first
    const tagSlugs = ['outdoor-activities', 'hiking', 'local-experiences']
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('id, slug')
      .in('slug', tagSlugs)
      
    if (tagsError) throw tagsError
    if (!tagsData || tagsData.length !== tagSlugs.length) {
      const foundSlugs = tagsData?.map(t => t.slug) || []
      const missingSlugs = tagSlugs.filter(slug => !foundSlugs.includes(slug))
      throw new Error(`Could not find all required tags with slugs: ${missingSlugs.join(', ')}. Please ensure they exist in the database. Found: ${foundSlugs.join(', ')}`)
    }

    const tagMap = tagsData.reduce((acc, tag) => {
        acc[tag.slug] = tag.id
        return acc
    }, {} as Record<string, string>)
    
    const interests = [
      { tag_id: tagMap['outdoor-activities'], strength: 9 },
      { tag_id: tagMap['hiking'], strength: 8 },
      { tag_id: tagMap['local-experiences'], strength: 7 }
    ]

    for (const interest of interests) {
      if (!interest.tag_id) {
        console.warn(`Skipping interest insert because tag_id is missing for one of the slugs: ${tagSlugs.join(', ')}`)
        continue
      }
      const { error: interestError } = await supabase
        .from('user_interests')
        .upsert({
          user_id: userId,
          tag_id: interest.tag_id,
          strength: interest.strength
        })

      if (interestError) throw interestError
    }
    console.log('✅ Interests set:', interests.map(i => ({ strength: i.strength, tag_id: i.tag_id })))

    // 6. Complete onboarding
    console.log('\n6️⃣ Completing onboarding...')
    const completePayload = createOnboardingPayload(userId, {
      p_onboarding_step: 5,
      p_complete_onboarding: true
    })
    const { data: completeInfo, error: completeError } = await supabase.rpc(
      'update_profile_onboarding',
      completePayload
    )

    if (completeError) throw completeError
    console.log('✅ Onboarding completed:', completeInfo)

    // 7. Verify final profile state
    console.log('\n7️⃣ Verifying final profile state...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError
    console.log('✅ Final profile state:', profile)

    console.log('\n🎉 All tests passed!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    // Clean up the test user
    if (userId) {
      console.log('\n🧹 Cleaning up test user...')
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
      if (deleteError) {
        console.error('❌ Error deleting test user:', deleteError)
      } else {
        console.log('✅ Test user deleted.')
      }
    }
  }
}

testOnboardingFlow() 