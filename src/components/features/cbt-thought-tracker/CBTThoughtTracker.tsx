'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EMOTIONS = [
  'Anxiety', 'Fear', 'Sadness', 'Anger', 'Guilt', 'Shame', 'Hurt', 'Frustration', 'Loneliness', 'Hopelessness', 'Other'
];
const DISTORTIONS = [
  'All-or-Nothing', 'Catastrophizing', 'Overgeneralization', 'Filtering', 'Mind Reading', 'Fortune Telling', 'Personalization', 'Emotional Reasoning', 'Should Statements', 'Labeling'
];

const FIELDS = [
  { key: 'situation', label: 'Situation', type: 'textarea', prompt: 'Describe the situation that triggered your thoughts.' },
  { key: 'ants', label: 'Automatic Negative Thoughts (ANTs)', type: 'textarea', prompt: 'What immediate negative thoughts did you have?' },
  { key: 'emotions', label: 'Emotions', type: 'emotions', prompt: 'What emotions did you feel? Select and rate their intensity.' },
  { key: 'behaviors', label: 'Behaviors', type: 'textarea', prompt: 'How did you react or what did you feel like doing?' },
  { key: 'distortions', label: 'Cognitive Distortions', type: 'distortions', prompt: 'Which cognitive distortions might be present?' },
  { key: 'evidenceFor', label: 'Evidence For', type: 'textarea', prompt: 'What factual evidence supports your negative thought?' },
  { key: 'evidenceAgainst', label: 'Evidence Against', type: 'textarea', prompt: 'What factual evidence contradicts your negative thought?' },
  { key: 'alternative', label: 'Alternative Explanation', type: 'textarea', prompt: 'What are some other possible explanations?' },
  { key: 'friendsAdvice', label: 'Friend’s Advice', type: 'textarea', prompt: 'What would you tell a friend in this situation?' },
  { key: 'likelihood', label: 'Likelihood', type: 'slider', prompt: 'How likely is the negative outcome? (0-100%)' },
  { key: 'coping', label: 'Coping Strategy', type: 'textarea', prompt: 'How could you cope if the worst happened?' },
  { key: 'balancedThought', label: 'Balanced Thought', type: 'textarea', prompt: 'Create a new, more realistic thought.' },
  { key: 'reevalEmotions', label: 'Re-evaluate Emotions', type: 'emotions', prompt: 'How do you feel now? Select and rate intensity.' },
];

function AILabel() {
  return <span className="ml-1 inline-block align-middle" title="AI suggestion">🤖</span>;
}

function EmotionSelector({ emotions, setEmotions, intensities, setIntensities, aiSuggestions }: any) {
  return (
    <div>
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
        {/* AI emotion suggestions as chips */}
        {aiSuggestions && aiSuggestions.length > 0 && (
          <>
            {aiSuggestions.map((s: string, idx: number) => (
              <button
                key={s + idx}
                type="button"
                className="px-2 py-1 rounded border border-blue-400 bg-blue-50 text-blue-700"
                onClick={() => {
                  if (!emotions.includes(s)) setEmotions([...emotions, s]);
                }}
              >
                {s} <AILabel />
              </button>
            ))}
          </>
        )}
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

function DistortionSelector({ distortions, setDistortions, aiSuggestions }: any) {
  return (
    <div>
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
        {/* AI distortion suggestions as chips */}
        {aiSuggestions && aiSuggestions.length > 0 && (
          <>
            {aiSuggestions.map((s: string, idx: number) => (
              <button
                key={s + idx}
                type="button"
                className="px-2 py-1 rounded border border-blue-400 bg-blue-50 text-blue-700"
                onClick={() => {
                  if (!distortions.includes(s)) setDistortions([...distortions, s]);
                }}
              >
                {s} <AILabel />
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function CBTThoughtTracker() {
  // State for each field
  const [situation, setSituation] = useState('');
  const [ants, setAnts] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [emotionIntensities, setEmotionIntensities] = useState<{[k: string]: number}>({});
  const [behaviors, setBehaviors] = useState('');
  const [distortions, setDistortions] = useState<string[]>([]);
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [alternative, setAlternative] = useState('');
  const [friendsAdvice, setFriendsAdvice] = useState('');
  const [likelihood, setLikelihood] = useState(0);
  const [coping, setCoping] = useState('');
  const [balancedThought, setBalancedThought] = useState('');
  const [reevalEmotions, setReevalEmotions] = useState<string[]>([]);
  const [reevalIntensities, setReevalIntensities] = useState<{[k: string]: number}>({});

  // Step state
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // AI state
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState<string|null>(null);

  // Compose context for AI
  function getContextForAI(fieldKey: string) {
    const context: Record<string, any> = {
      situation,
      ants,
      emotions: emotions.join(', '),
      emotionIntensities,
      behaviors,
      distortions: distortions.join(', '),
      evidenceFor,
      evidenceAgainst,
      alternative,
      friendsAdvice,
      likelihood,
      coping,
      balancedThought,
      reevalEmotions: reevalEmotions.join(', '),
      reevalIntensities,
    };
    // Only include up to the previous field
    const idx = FIELDS.findIndex(f => f.key === fieldKey);
    const keys = FIELDS.slice(0, idx).map(f => f.key);
    const prevContext = keys.map(k => `${FIELDS.find(f => f.key === k)?.label}: ${context[k] || ''}`).join('\n');
    return prevContext;
  }

  // Fetch AI suggestions for the current step
  useEffect(() => {
    setAISuggestions([]);
    setAIError(null);
    setAILoading(false);
    if (step >= FIELDS.length) return;
    const field = FIELDS[step];
    // Only fetch for textareas, slider, or distortions
    if (['textarea', 'slider', 'distortions'].includes(field.type)) {
      setAILoading(true);
      const prevContext = getContextForAI(field.key);
      fetch('/api/cbt-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'field_suggestion',
          field: field.key,
          context: prevContext,
          prompt: field.prompt,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.response) {
            const suggestions = data.response.split(/\n|\d+\. /).map((s: string) => s.trim()).filter(Boolean);
            setAISuggestions(suggestions);
          } else if (data.error) {
            setAIError(data.error);
          }
        })
        .catch(err => setAIError('AI error: ' + err.message))
        .finally(() => setAILoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
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
      setStep(FIELDS.length); // Go to review
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

  // Render current step
  let stepContent = null;
  const field = FIELDS[step];
  if (step < FIELDS.length) {
    stepContent = (
      <div className="space-y-4">
        <label className="block font-semibold mb-1">{field.label}</label>
        {field.type === 'textarea' && (
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            value={(() => {
              switch (field.key) {
                case 'situation': return situation;
                case 'ants': return ants;
                case 'behaviors': return behaviors;
                case 'evidenceFor': return evidenceFor;
                case 'evidenceAgainst': return evidenceAgainst;
                case 'alternative': return alternative;
                case 'friendsAdvice': return friendsAdvice;
                case 'coping': return coping;
                case 'balancedThought': return balancedThought;
                default: return '';
              }
            })()}
            onChange={e => {
              switch (field.key) {
                case 'situation': setSituation(e.target.value); break;
                case 'ants': setAnts(e.target.value); break;
                case 'behaviors': setBehaviors(e.target.value); break;
                case 'evidenceFor': setEvidenceFor(e.target.value); break;
                case 'evidenceAgainst': setEvidenceAgainst(e.target.value); break;
                case 'alternative': setAlternative(e.target.value); break;
                case 'friendsAdvice': setFriendsAdvice(e.target.value); break;
                case 'coping': setCoping(e.target.value); break;
                case 'balancedThought': setBalancedThought(e.target.value); break;
                default: break;
              }
            }}
          />
        )}
        {field.type === 'emotions' && (
          <EmotionSelector
            emotions={field.key === 'emotions' ? emotions : reevalEmotions}
            setEmotions={field.key === 'emotions' ? setEmotions : setReevalEmotions}
            intensities={field.key === 'emotions' ? emotionIntensities : reevalIntensities}
            setIntensities={field.key === 'emotions' ? setEmotionIntensities : setReevalIntensities}
            aiSuggestions={aiSuggestions}
          />
        )}
        {field.type === 'distortions' && (
          <DistortionSelector distortions={distortions} setDistortions={setDistortions} aiSuggestions={aiSuggestions} />
        )}
        {field.type === 'slider' && (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={likelihood}
              onChange={e => setLikelihood(Number(e.target.value))}
              className="flex-1"
            />
            <span>{likelihood}%</span>
          </div>
        )}
        {/* AI Suggestions for textarea/slider fields */}
        {['textarea', 'slider'].includes(field.type) && (
          <div>
            {aiLoading && <div className="text-center text-gray-500">Loading AI suggestions...</div>}
            {aiError && <div className="text-center text-red-600">{aiError}</div>}
            {aiSuggestions.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                <div className="text-sm text-gray-700 flex items-center mb-1"><AILabel /> Suggestions:</div>
                <ul className="list-disc list-inside space-y-1">
                  {aiSuggestions.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>{s}</span>
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                        onClick={() => {
                          switch (field.key) {
                            case 'situation': setSituation(s); break;
                            case 'ants': setAnts(s); break;
                            case 'behaviors': setBehaviors(s); break;
                            case 'evidenceFor': setEvidenceFor(s); break;
                            case 'evidenceAgainst': setEvidenceAgainst(s); break;
                            case 'alternative': setAlternative(s); break;
                            case 'friendsAdvice': setFriendsAdvice(s); break;
                            case 'coping': setCoping(s); break;
                            case 'balancedThought': setBalancedThought(s); break;
                            default: break;
                          }
                        }}
                      >
                        Use
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  } else {
    // Review step
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

  // Progress bar
  const progress = Math.round((step / FIELDS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">CBT Thought Tracker</h2>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1 h-2 rounded bg-gray-200 relative">
          <div className="h-2 rounded bg-blue-500" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="ml-2 text-sm text-gray-600">Step {Math.min(step + 1, FIELDS.length + 1)} / {FIELDS.length + 1}</span>
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (step === FIELDS.length) handleSubmit();
          else setStep(step + 1);
        }}
        className="space-y-4"
      >
        {stepContent}
        <div className="flex gap-2 mt-4">
          {step > 0 && step <= FIELDS.length && (
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < FIELDS.length && (
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded" disabled={loading}>
              Next
            </button>
          )}
          {step === FIELDS.length && (
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