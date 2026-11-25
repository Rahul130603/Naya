import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listLikedQaIds,
  listQaThreads,
  normalizeQaThread,
  postDoctorAnswer,
  postQaQuestion,
  toggleHelpful,
} from '../src/lib/communityQa.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    clear: () => map.clear(),
  };
}

function installMockWindow() {
  const listeners = new Map();
  const storage = createMemoryStorage();
  globalThis.window = {
    localStorage: storage,
    addEventListener: (type, fn) => {
      const list = listeners.get(type) || [];
      listeners.set(type, [...list, fn]);
    },
    removeEventListener: (type, fn) => {
      const list = listeners.get(type) || [];
      listeners.set(type, list.filter((item) => item !== fn));
    },
    dispatchEvent: (event) => {
      const list = listeners.get(event.type) || [];
      for (const fn of list) fn(event);
    },
  };
  globalThis.Event = class MockEvent {
    constructor(type) {
      this.type = type;
    }
  };
}

test('patients can post anonymous doubts and doctors can publish answers', () => {
  installMockWindow();

  const initialCount = listQaThreads().length;
  assert.ok(initialCount >= 4);

  const created = postQaQuestion({
    title: 'Low desire after starting anxiety medication',
    question: 'Since starting SSRIs last month my libido dropped sharply. Is this reversible?',
    category: 'Performance Anxiety',
    ageGroup: '25–34',
    gender: 'Male',
    isAnonymous: true,
  });

  assert.equal(created.patientAlias, 'Anonymous • 25–34 yrs');
  assert.equal(created.answers.length, 0);
  assert.equal(listQaThreads().length, initialCount + 1);

  const answer = postDoctorAnswer(created.id, {
    doctorName: 'Dr. Arvind Swaminathan',
    doctorSpecialty: 'Clinical Sexologist',
    doctorRegNo: 'TN-MED-44819',
    body: 'SSRI-related libido changes are common and manageable. Never stop your medication abruptly; book a review to discuss safe adjustments.',
    recommendation: 'Video Consultation Recommended',
  });

  assert.equal(answer.doctorName, 'Dr. Arvind Swaminathan');
  const updated = listQaThreads().find((t) => t.id === created.id);
  assert.equal(updated.answers.length, 1);
  assert.equal(updated.answers[0].recommendation, 'Video Consultation Recommended');

  const likedRes = toggleHelpful(created.id);
  assert.equal(likedRes.liked, true);
  assert.ok(listLikedQaIds().includes(created.id));
  const afterHelpful = listQaThreads().find((t) => t.id === created.id);
  assert.equal(afterHelpful.helpfulCount, 1);

  const unlikedRes = toggleHelpful(created.id);
  assert.equal(unlikedRes.liked, false);
  assert.ok(!listLikedQaIds().includes(created.id));
  const afterUnlike = listQaThreads().find((t) => t.id === created.id);
  assert.equal(afterUnlike.helpfulCount, 0);
});

test('normalizeQaThread rejects missing title or question', () => {
  assert.equal(normalizeQaThread({ title: '', question: 'Details' }), null);
  assert.equal(normalizeQaThread({ title: 'Headline', question: '   ' }), null);
});
