'use strict';
const { f } = require('./helpers');

module.exports = {
  'word-counter': {
    h1: 'Word Counter',
    seoTitle: 'Word Counter — Words, Characters, Sentences and Reading Time',
    desc: 'Count words, characters, characters without spaces, sentences and paragraphs in text, with an estimated reading time. All counting happens locally.',
    intro: 'Check an essay draft against a word limit or estimate how long a passage takes to read. Paste text below and every count updates as you type, without sending the text anywhere.',
    icon: 'text',
    form: `
      <div class="field"><label for="wc-text">Your text</label><textarea id="wc-text" rows="9" placeholder="Paste or type your text here…"></textarea></div>
      <div class="stat-grid" id="wc-stats" style="margin-top:1.1rem"></div>
      <p class="field-hint" style="margin-top:.8rem">Reading time uses 200 words per minute. Change the speed in the <a href="/tools/reading-time-calculator/">Reading Time Calculator</a>.</p>
      <div class="btn-row" style="margin-top:1rem"><button class="btn btn-secondary btn-small" type="button" id="wc-copy">Copy text</button><button class="btn btn-secondary btn-small" type="button" id="wc-clear">Clear text</button></div>`,
    formula: `<p>Words are sequences of characters separated by whitespace. Characters without spaces remove every whitespace character. Sentence estimates count groups ending in <code>.</code>, <code>!</code> or <code>?</code>. Reading minutes: <code>words ÷ 200</code>.</p>`,
    example: `<p><strong>Example:</strong> the sentence “Study smarter. Achieve more.” contains 4 words, 30 characters including spaces and 2 sentences. Automated counts are estimates; publishers may count hyphenated words or numerals differently.</p>`,
    steps: ['Paste or type your text into the box.', 'Read the live counts below.', 'Copy or clear the text using the buttons.'],
    faq: [
      ['Is my text uploaded?', 'No. All counting runs in your browser and the text is never sent to a server.'],
      ['How are hyphenated words counted?', 'As one word, because they are not separated by whitespace.'],
      ['Why is the reading time an estimate?', 'Reading speed varies with difficulty and purpose. Adjust the speed in the reading time calculator.']
    ]
  },
  'character-counter': {
    h1: 'Character Counter',
    seoTitle: 'Character Counter — Live Count With or Without Spaces',
    desc: 'A live character counter with spaces included or excluded, plus word and line counts, clear and copy controls.',
    intro: 'Check text against character limits for applications, captions or assignments. Choose whether spaces count, and see the total update instantly as you type.',
    icon: 'text',
    form: `
      <div class="field"><label for="cc-text">Your text</label><textarea id="cc-text" rows="9" placeholder="Type or paste text here…"></textarea></div>
      <div class="segmented" style="margin-top:1rem" role="group" aria-label="Space counting mode"><button type="button" data-cc-mode="with" aria-pressed="true">Spaces included</button><button type="button" data-cc-mode="without" aria-pressed="false">Spaces excluded</button></div>
      <div class="stat-grid" id="cc-stats" style="margin-top:1rem"></div>
      <div class="btn-row" style="margin-top:1rem"><button class="btn btn-secondary btn-small" type="button" id="cc-copy">Copy text</button><button class="btn btn-secondary btn-small" type="button" id="cc-clear">Clear</button></div>`,
    formula: `<p>Spaces included: <code>text.length</code>. Spaces excluded: the same count after removing all whitespace characters, including tabs and line breaks.</p>`,
    example: `<p><strong>Example:</strong> “Hello world” has 11 characters with the space and 10 without it. Different platforms may count line breaks differently, so check the rules for your form.</p>`,
    steps: ['Type or paste text.', 'Choose whether spaces should be included.', 'Copy or clear your text when finished.'],
    faq: [
      ['Does it count emoji as one character?', 'JavaScript counts Unicode code units, so some emoji appear as two. Most form limits use the same rule, but check the target platform.'],
      ['Do line breaks count?', 'They are included with spaces and removed with spaces excluded.'],
      ['Is text stored?', 'No. The counter works entirely in your browser.']
    ]
  },
  'reading-time-calculator': {
    h1: 'Reading Time Calculator',
    seoTitle: 'Reading Time Calculator — Words per Minute and Time Estimate',
    desc: 'Estimate reading time from word count and an adjustable reading speed in words per minute, with a clear explanation of the assumptions.',
    intro: 'Estimate how long an article, chapter or essay will take to read. Enter a word count or paste text, set a reading speed, and see the result in minutes and seconds.',
    icon: 'clock',
    form: `
      <div class="form-grid">
        ${f('rt-words', 'Word count', 'number', 'min="0" step="1" placeholder="e.g. 1200"')}
        ${f('rt-wpm', 'Reading speed (words per minute)', 'number', 'min="1" step="1" value="200"')}
      </div>
      <div class="field" style="margin-top:1rem"><label for="rt-text">Or paste text to count words</label><textarea id="rt-text" rows="5" placeholder="Optional: paste text instead of typing a word count"></textarea></div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Estimate reading time</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p><code>minutes = word count ÷ words per minute</code>. Common adult reading speeds are around 200–250 words per minute; technical material is often slower.</p>`,
    example: `<p><strong>Example:</strong> 1,200 words at 200 words per minute takes 6 minutes. At 250 wpm it takes 4.8 minutes, about 4 minutes 48 seconds.</p>`,
    steps: ['Enter a word count or paste text.', 'Set a realistic reading speed.', 'Select Estimate reading time.'],
    faq: [
      ['What is a typical reading speed?', 'Around 200–250 words per minute for general text; use a lower value for dense or technical material.'],
      ['Does this measure comprehension time?', 'No. It only estimates time to read the words, not time to think or take notes.'],
      ['Can I use it for a presentation?', 'Yes, set your own speed to plan roughly how long a script will take to deliver.']
    ]
  },
  'text-case-converter': {
    h1: 'Text Case Converter',
    seoTitle: 'Text Case Converter — Upper, Lower, Title and Sentence Case',
    desc: 'Convert text to uppercase, lowercase, title case or sentence case in your browser and copy the result with one click.',
    intro: 'Change the case of a title, paragraph or list without retyping it. Choose uppercase, lowercase, title case or sentence case and copy the converted text.',
    icon: 'text',
    form: `
      <div class="field"><label for="tc-input">Original text</label><textarea id="tc-input" rows="7" placeholder="Type or paste text here…"></textarea></div>
      <div class="btn-row" style="margin-top:1rem">
        <button class="btn btn-secondary btn-small" type="button" data-tc-case="upper">UPPERCASE</button>
        <button class="btn btn-secondary btn-small" type="button" data-tc-case="lower">lowercase</button>
        <button class="btn btn-secondary btn-small" type="button" data-tc-case="title">Title Case</button>
        <button class="btn btn-secondary btn-small" type="button" data-tc-case="sentence">Sentence case</button>
      </div>
      <div class="field" style="margin-top:1.3rem"><label for="tc-output">Converted text</label><textarea id="tc-output" rows="7" readonly></textarea></div>
      <div class="btn-row" style="margin-top:1rem"><button class="btn btn-primary btn-small" type="button" id="tc-copy">Copy result</button><button class="btn btn-secondary btn-small" type="button" id="tc-swap">Swap back</button></div>`,
    formula: `<p>Uppercase and lowercase use the browser’s Unicode-aware transformations. Title case capitalises the first letter of each word; sentence case capitalises the first letter of the text and leaves proper nouns unchanged because the tool cannot recognise them reliably.</p>`,
    example: `<p><strong>Example:</strong> “study smarter every day” becomes “Study Smarter Every Day” in title case and “Study smarter every day” in sentence case.</p>`,
    steps: ['Paste text into the original text box.', 'Choose a case conversion.', 'Copy the result or swap it back for editing.'],
    faq: [
      ['Does title case follow a particular style guide?', 'No. It uses a simple word-by-word rule and will capitalise short words that some style guides leave lowercase.'],
      ['Will proper nouns stay correct?', 'The tool cannot identify them. Check names and acronyms after converting.'],
      ['Is my text saved?', 'No. Conversion is local and temporary.']
    ]
  },
  'citation-formatter': {
    h1: 'Citation Formatter',
    seoTitle: 'Citation Formatter — Basic APA, MLA and Chicago References',
    desc: 'Format basic book references in APA, MLA and Chicago styles from details you provide, with clear limits and no invented information.',
    intro: 'Build a simple reference from the author, year, title, publisher and edition that you supply. This tool covers basic book formats only and will never invent missing bibliographic details. Always check your institution’s style guide before submitting work.',
    icon: 'pencil',
    form: `
      <div class="notice notice-warning">This formatter handles basic book references only. It does not verify sources, generate in-text citations, or replace an official style manual.</div>
      <div class="field"><label for="cf-style">Citation style</label><select id="cf-style"><option value="APA">APA 7 — author, year, title, publisher</option><option value="MLA">MLA 9 — author, title, publisher, year</option><option value="Chicago">Chicago author-date</option></select></div>
      <div class="form-grid" style="margin-top:1rem">
        ${f('cf-author', 'Author', 'text', 'placeholder="e.g. Rivera, A."')}
        ${f('cf-year', 'Year', 'text', 'placeholder="e.g. 2022"')}
        ${f('cf-title', 'Book title', 'text', 'placeholder="e.g. Learning that lasts"')}
        ${f('cf-publisher', 'Publisher', 'text', 'placeholder="e.g. Example Press"')}
        ${f('cf-edition', 'Edition (optional)', 'text', 'placeholder="e.g. 2nd"')}
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Format citation</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>APA book pattern: <code>Author. (Year). Title. Publisher.</code></p>
      <p>MLA book pattern: <code>Author. Title. Publisher, Year.</code></p>
      <p>Chicago author-date book pattern: <code>Author. Year. Title. Publisher.</code></p>
      <p>Only fields you provide are included; missing fields are reported rather than guessed.</p>`,
    example: `<p><strong>Example:</strong> with author “Rivera, A.”, year 2022, title “Learning that lasts” and publisher “Example Press”, APA produces: Rivera, A. (2022). Learning that lasts. Example Press.</p>`,
    steps: ['Choose a citation style.', 'Enter details copied from the source itself.', 'Format the citation, review warnings and copy the result.'],
    faq: [
      ['Can I cite a journal article or website?', 'Not in this release. The tool only formats basic book references.'],
      ['Will it make up a missing year or publisher?', 'Never. Missing details are listed as warnings and left out of the reference.'],
      ['Is the output guaranteed to be correct?', 'No. It is a starting point; check punctuation, italics and ordering against the official style guide.']
    ]
  }
};
