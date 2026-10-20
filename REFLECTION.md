# Reflection

**Name / Andrew ID:**
Alice Zhang / alicez2

**Recitation group members (Task 2):**
Coral Zhu

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

The property 'returns sorted, non-overlapping intervals' killed no mutants, but it is still a valid property
because it is still an invariant that holds true for every input. A bug in which the output intervals
aren't sorted would be caught by this property.

### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

singlePass was flaky because the generator didn't produce a guess with more of a certain letter than in the secret
(for a letter that is in the secret) often enough. I fixed it by making a targeted generator
that chose letters out of a 3-letter alphabet, to make it way more common for the guess to share letters with
and have more of a certain letter than the secret.

Before:
singlePass     flaky: killed in 4/5 runs  by: never credits a letter more times than the secret contains it
      Counterexample: ["AAAQA","AQAQA"]
      AssertionError: expected 2 to be less than or equal to 1

After:
singlePass     killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["AABAA","ABBAA"]
      AssertionError: expected 2 to be less than or equal to 1

### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

For mergesIntegerNeighbors, the counterexample was [[[0,0],[1,1]]] expected [[+0,+0 ],[1,1]]
but got [[+0,1]]. According to the specification, "[1, 2] and [3, 4] leave a gap (2 < x < 3), so they stay separate.",
so that inputs tests that neighboring case to make sure it does stay separate, exposing a bug when it doesn't.

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

Follow-up prompts. One would be that steer mode follow-ups are sent before any queue mode
follow-ups that were still in queue when the steer follow-up was entered. This is an invariant because
steer mode follow-ups are always sent immediately. The generator
would need the session to be not idle throughout the test so that queued follow-ups
can actually exist, and also arbitrarily choose between the two delivery modes.
A second property would be that canceled queue follow-ups are deleted from the queue.
This is a conditional property because if a cancel occurs, the canceled follow-up is deleted. The generator
should be targetted for queue mode follow-ups and include cancels only on non-empty queues.