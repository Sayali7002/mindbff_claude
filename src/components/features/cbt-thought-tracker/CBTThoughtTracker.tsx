'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
// If you have a shared supabase client, import it instead of creating a new one
// import { supabase } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EMOTIONS = [
  'Anxiety', 'Fear', 'Sadness', 'Anger', 'Guilt', 'Shame', 'Hurt', 'Frustration', 'Loneliness', 'Hopelessness', 'Other'
];
const DISTORTIONS = [
  'All-or-Nothing', 'Catastrophizing', 'Overgeneralization', 'Filtering', 'Mind Reading', 'Fortune Telling', 'Personalization', 'Emotional Reasoning', 'Should Statements', 'Labeling'
];

const STEPS = [
  'Situation', 'Distortions', 'Challenge', 'Reframe', 'Review'
];

function EmotionSelector({ emotions, setEmotions, intensities, setIntensities }: any) {
  return (
    <div>
      <label className="block font-semibold mb-1">Emotions</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {EMOTIONS.map(e => (
          <button
            key={e}
            type="button"
            className={`px-2 py-1 rounded border ${emotions.includes(e) ? 'bg-blue-200 border-blue-500' : 'bg-gray-100 border-gray-300'}`}
            onClick={() => {
              setEmotions(
                emotions.includes(e)
                  ? emotions.filter((em: string) => em !== e)
                  : [...emotions, e]
              );
            }}
          >
            {e}
          </button>
        ))}
      </div>
      {emotions.map((e: string) => (
        <div key={e} className="flex items-center gap-2 mb-1">
          <span className="w-24">{e}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={intensities[e] || 5}
            onChange={ev => setIntensities({ ...intensities, [e]: Number(ev.target.value) })}
            className="flex-1"
          />
          <span>{intensities[e] || 5}</span>
        </div>
      ))}
    </div>
  );
}

function DistortionSelector({ distortions, setDistortions }: any) {
  return (
    <div>
      <label className="block font-semibold mb-1">Cognitive Distortions</label>
      <div className="flex flex-wrap gap-2">
        {DISTORTIONS.map(d => (
          <label key={d} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={distortions.includes(d)}
              onChange={() => {
                setDistortions(
                  distortions.includes(d)
                    ? distortions.filter((x: string) => x !== d)
                    : [...distortions, d]
                );
              }}
            />
            {d}
          </label>
        ))}
      </div>
    </div>
  );
}

function AILabel() {
  return <span className="ml-1 inline-block align-middle" title="AI suggestion">🤖</span>;
}

export default function CBTThoughtTracker() {
  const [step, setStep] = useState(0);
  // Step 1
  const [situation, setSituation] = useState('');
  const [ants, setAnts] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [emotionIntensities, setEmotionIntensities] = useState<{[k: string]: number}>({});
  const [behaviors, setBehaviors] = useState('');
  // Step 2
  const [distortions, setDistortions] = useState<string[]>([]);
  // Step 3
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [alternative, setAlternative] = useState('');
  const [friendsAdvice, setFriendsAdvice] = useState('');
  const [likelihood, setLikelihood] = useState(0);
  const [coping, setCoping] = useState('');
  // Step 4
  const [balancedThought, setBalancedThought] = useState('');
  const [reevalEmotions, setReevalEmotions] = useState<string[]>([]);
  const [reevalIntensities, setReevalIntensities] = useState<{[k: string]: number}>({});
  // Review/history
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // AI state
  const [aiDistortionLoading, setAIDistortionLoading] = useState(false);
  const [aiChallengePrompts, setAIChallengePrompts] = useState<string[]>([]);
  const [aiChallengeLoading, setAIChallengeLoading] = useState(false);
  const [aiBalancedSuggestions, setAIBalancedSuggestions] = useState<string[]>([]);
  const [aiBalancedLoading, setAIBalancedLoading] = useState(false);
  const [aiError, setAIError] = useState<string|null>(null);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Step 2: Suggest distortions after ANTs entered
  useEffect(() => {
    if (step === 1 && ants.trim()) {
      setAIDistortionLoading(true);
      setAIError(null);
      fetch('/api/cbt-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'distortion_suggestion', ants }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.response) {
            // Parse comma-separated list
            const suggestions = data.response.split(',').map((d: string) => d.trim()).filter(Boolean);
            setDistortions(suggestions);
          } else if (data.error) {
            setAIError(data.error);
          }
        })
        .catch(err => setAIError('AI error: ' + err.message))
        .finally(() => setAIDistortionLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, ants]);

  // Step 3: Challenge prompts
  useEffect(() => {
    if (step === 2 && ants.trim() && distortions.length > 0) {
      setAIChallengeLoading(true);
      setAIError(null);
      fetch('/api/cbt-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'challenge_prompt', ants, distortions: distortions.join(', ') }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.response) {
            // Split into lines or numbered list
            const prompts = data.response.split(/\n|\d+\. /).map((p: string) => p.trim()).filter(Boolean);
            setAIChallengePrompts(prompts);
          } else if (data.error) {
            setAIError(data.error);
          }
        })
        .catch(err => setAIError('AI error: ' + err.message))
        .finally(() => setAIChallengeLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, ants, distortions]);

  // Step 4: Balanced thought suggestions
  useEffect(() => {
    if (step === 3 && ants.trim() && distortions.length > 0 && evidenceAgainst.trim()) {
      setAIBalancedLoading(true);
      setAIError(null);
      fetch('/api/cbt-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'balanced_thought', ants, distortions: distortions.join(', '), evidenceAgainst }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.response) {
            // Split numbered list
            const suggestions = data.response.split(/\n|\d+\. /).map((s: string) => s.trim()).filter(Boolean);
            setAIBalancedSuggestions(suggestions);
          } else if (data.error) {
            setAIError(data.error);
          }
        })
        .catch(err => setAIError('AI error: ' + err.message))
        .finally(() => setAIBalancedLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, ants, distortions, evidenceAgainst]);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    // Replace 'cbt_thought_records' with your actual Supabase table name
    const { data, error } = await supabase
      .from('cbt_thought_records')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError('Failed to fetch history');
    else setHistory(data || []);
    setLoading(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Replace with user id logic if available
    const user_id = 'demo-user';
    const record = {
      id: uuidv4(),
      user_id,
      created_at: new Date().toISOString(),
      situation,
      ants,
      emotions,
      emotion_intensities: emotionIntensities,
      behaviors,
      distortions,
      evidence_for: evidenceFor,
      evidence_against: evidenceAgainst,
      alternative,
      friends_advice: friendsAdvice,
      likelihood,
      coping,
      balanced_thought: balancedThought,
      reeval_emotions: reevalEmotions,
      reeval_intensities: reevalIntensities,
    };
    const { error } = await supabase.from('cbt_thought_records').insert([record]);
    if (error) setError('Failed to save record');
    else {
      setSuccess('Record saved!');
      fetchHistory();
      setStep(4); // Go to review
    }
    setLoading(false);
  }

  function resetForm() {
    setSituation('');
    setAnts('');
    setEmotions([]);
    setEmotionIntensities({});
    setBehaviors('');
    setDistortions([]);
    setEvidenceFor('');
    setEvidenceAgainst('');
    setAlternative('');
    setFriendsAdvice('');
    setLikelihood(0);
    setCoping('');
    setBalancedThought('');
    setReevalEmotions([]);
    setReevalIntensities({});
    setStep(0);
    setError(null);
    setSuccess(null);
  }

  // UI rendering for each step
  let stepContent = null;
  if (step === 0) {
    stepContent = (
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Situation</label>
          <textarea className="w-full border rounded p-2" rows={2} value={situation} onChange={e => setSituation(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Automatic Negative Thoughts (ANTs)</label>
          <textarea className="w-full border rounded p-2" rows={2} value={ants} onChange={e => setAnts(e.target.value)} />
        </div>
        <EmotionSelector emotions={emotions} setEmotions={setEmotions} intensities={emotionIntensities} setIntensities={setEmotionIntensities} />
        <div>
          <label className="block font-semibold mb-1">Behaviors</label>
          <textarea className="w-full border rounded p-2" rows={2} value={behaviors} onChange={e => setBehaviors(e.target.value)} />
        </div>
      </div>
    );
  } else if (step === 1) {
    stepContent = (
      <div className="space-y-4">
        <DistortionSelector distortions={distortions} setDistortions={setDistortions} />
        {aiDistortionLoading && <div className="text-center text-gray-500">Loading AI suggestions...</div>}
        {aiError && <div className="text-center text-red-600">{aiError}</div>}
      </div>
    );
  } else if (step === 2) {
    stepContent = (
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Evidence For</label>
          <textarea className="w-full border rounded p-2" rows={2} value={evidenceFor} onChange={e => setEvidenceFor(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Evidence Against</label>
          <textarea className="w-full border rounded p-2" rows={2} value={evidenceAgainst} onChange={e => setEvidenceAgainst(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Alternative Explanation</label>
          <textarea className="w-full border rounded p-2" rows={2} value={alternative} onChange={e => setAlternative(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Friend's Advice</label>
          <textarea className="w-full border rounded p-2" rows={2} value={friendsAdvice} onChange={e => setFriendsAdvice(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Likelihood of Negative Outcome</label>
          <input type="range" min={0} max={100} value={likelihood} onChange={e => setLikelihood(Number(e.target.value))} className="w-full" />
          <span>{likelihood}%</span>
        </div>
        <div>
          <label className="block font-semibold mb-1">Coping Strategy</label>
          <textarea className="w-full border rounded p-2" rows={2} value={coping} onChange={e => setCoping(e.target.value)} />
        </div>
        {aiChallengeLoading && <div className="text-center text-gray-500">Loading AI challenge prompts...</div>}
        {aiError && <div className="text-center text-red-600">{aiError}</div>}
        {aiChallengePrompts.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2">AI Challenge Prompts</h4>
            <ul className="list-disc list-inside space-y-1">
              {aiChallengePrompts.map((prompt, idx) => (
                <li key={idx}>
                  <span>{prompt}</span>
                  <button
                    type="button"
                    className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                    onClick={() => setAlternative(prompt)}
                  >
                    Use
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  } else if (step === 3) {
    stepContent = (
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Balanced Thought</label>
          <textarea className="w-full border rounded p-2" rows={2} value={balancedThought} onChange={e => setBalancedThought(e.target.value)} />
        </div>
        <EmotionSelector emotions={reevalEmotions} setEmotions={setReevalEmotions} intensities={reevalIntensities} setIntensities={setReevalIntensities} />
        {aiBalancedLoading && <div className="text-center text-gray-500">Loading AI balanced thought suggestions...</div>}
        {aiError && <div className="text-center text-red-600">{aiError}</div>}
        {aiBalancedSuggestions.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2">AI Balanced Thought Suggestions</h4>
            <ul className="list-disc list-inside space-y-1">
              {aiBalancedSuggestions.map((suggestion, idx) => (
                <li key={idx}>
                  <span>{suggestion}</span>
                  <button
                    type="button"
                    className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs"
                    onClick={() => setBalancedThought(suggestion)}
                  >
                    Use
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  } else if (step === 4) {
    stepContent = (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded">
          <div className="font-semibold mb-2">Review</div>
          <div><b>Situation:</b> {situation}</div>
          <div><b>ANTs:</b> {ants}</div>
          <div><b>Emotions:</b> {emotions.map(e => `${e} (${emotionIntensities[e] || 5})`).join(', ')}</div>
          <div><b>Behaviors:</b> {behaviors}</div>
          <div><b>Distortions:</b> {distortions.join(', ')}</div>
          <div><b>Evidence For:</b> {evidenceFor}</div>
          <div><b>Evidence Against:</b> {evidenceAgainst}</div>
          <div><b>Alternative:</b> {alternative}</div>
          <div><b>Friend's Advice:</b> {friendsAdvice}</div>
          <div><b>Likelihood:</b> {likelihood}%</div>
          <div><b>Coping:</b> {coping}</div>
          <div><b>Balanced Thought:</b> {balancedThought}</div>
          <div><b>Re-evaluated Emotions:</b> {reevalEmotions.map(e => `${e} (${reevalIntensities[e] || 5})`).join(', ')}</div>
        </div>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={resetForm}>Start New Record</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">CBT Thought Tracker</h2>
      <div className="mb-4 flex items-center gap-2">
        {STEPS.map((label, idx) => (
          <div key={label} className={`flex-1 h-2 rounded ${idx <= step ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
        ))}
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (step === 3) handleSubmit();
          else setStep(step + 1);
        }}
        className="space-y-4"
      >
        {stepContent}
        <div className="flex gap-2 mt-4">
          {step > 0 && step < 4 && (
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 3 && (
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded" disabled={loading}>
              Next
            </button>
          )}
          {step === 3 && (
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
              {loading ? 'Saving...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
      {/* History Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Your Past Thought Records</h3>
        {loading && <div>Loading...</div>}
        {history.length === 0 && !loading && <div className="text-gray-500">No records yet.</div>}
        <ul className="space-y-2">
          {history.map((rec, idx) => (
            <li key={rec.id || idx} className="p-2 border rounded bg-gray-50">
              <div className="text-sm text-gray-700"><b>Date:</b> {rec.created_at?.slice(0, 16).replace('T', ' ')}</div>
              <div className="text-sm"><b>Situation:</b> {rec.situation}</div>
              <div className="text-sm"><b>Balanced Thought:</b> {rec.balanced_thought}</div>
              <div className="text-xs text-gray-500">ANTs: {rec.ants}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}