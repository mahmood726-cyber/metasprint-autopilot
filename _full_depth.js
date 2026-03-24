const fs = require('fs');
const lines = fs.readFileSync('_check_syntax.js', 'utf8').split('\n');

// Track depth but be smarter about strings and comments
let braceDepth = 0;
let parenDepth = 0;
let inString = null; // null, '"', "'", '`'
let inBlockComment = false;
let templateDepth = 0; // for template literal ${} nesting

let events = []; // significant depth changes

for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const prevBrace = braceDepth;
    const prevParen = parenDepth;
    let i = 0;
    let inLineComment = false;
    
    while (i < line.length) {
        const c = line[i];
        const next = i + 1 < line.length ? line[i+1] : '';
        
        if (inBlockComment) {
            if (c === '*' && next === '/') { inBlockComment = false; i += 2; continue; }
            i++; continue;
        }
        if (inLineComment) break;
        
        if (inString === '`') {
            // Template literal - handle ${} 
            if (c === '\\') { i += 2; continue; }
            if (c === '$' && next === '{') {
                templateDepth++;
                inString = null; // back to normal code inside ${}
                i += 2; continue;
            }
            if (c === '`') { inString = null; }
            i++; continue;
        }
        
        if (inString) {
            if (c === '\\') { i += 2; continue; }
            if (c === inString) inString = null;
            i++; continue;
        }
        
        // Check for template depth return
        if (templateDepth > 0 && c === '}') {
            // Could be closing a ${} or a real brace
            // This is tricky... for simplicity, let's not try to be perfect with template depth
            // since the main issue is likely a simple brace mismatch, not template-related
        }
        
        if (c === '/' && next === '/') { inLineComment = true; break; }
        if (c === '/' && next === '*') { inBlockComment = true; i += 2; continue; }
        
        // Check for regex (simple heuristic: / after operator or at start of expression)
        // Skip this - regex detection is too complex and the main issue is {} balance
        
        if (c === '"') { inString = '"'; i++; continue; }
        if (c === "'") { inString = "'"; i++; continue; }
        if (c === '`') { inString = '`'; i++; continue; }
        
        if (c === '{') braceDepth++;
        if (c === '}') braceDepth--;
        if (c === '(') parenDepth++;
        if (c === ')') parenDepth--;
        i++;
    }
    
    const bd = braceDepth - prevBrace;
    const pd = parenDepth - prevParen;
    
    // Record significant events
    if (Math.abs(bd) >= 1 || Math.abs(pd) >= 1) {
        events.push({ line: lineIdx + 1, bd, pd, braceDepth, parenDepth, text: line.trimStart().slice(0, 100) });
    }
}

console.log(`Final depth: braces=${braceDepth}, parens=${parenDepth}`);
console.log(`(should both be 0 for balanced code)`);

if (braceDepth !== 0) {
    // Find where the imbalance started
    // Look for the last time braceDepth was 0
    let lastZeroBrace = 0;
    for (const ev of events) {
        if (ev.braceDepth === 0) lastZeroBrace = ev.line;
    }
    console.log(`\nLast time braces at 0: line ${lastZeroBrace} (HTML ${lastZeroBrace + 1877})`);
    
    // Show events around that point
    console.log('Events after last zero:');
    let count = 0;
    for (const ev of events) {
        if (ev.line >= lastZeroBrace && count < 30) {
            console.log(`  JS:${ev.line} HTML:${ev.line+1877} braces=${ev.braceDepth}(${ev.bd>0?'+':''}${ev.bd}) parens=${ev.parenDepth}(${ev.pd>0?'+':''}${ev.pd}) | ${ev.text}`);
            count++;
        }
    }
}

if (parenDepth !== 0) {
    let lastZeroParen = 0;
    for (const ev of events) {
        if (ev.parenDepth === 0) lastZeroParen = ev.line;
    }
    console.log(`\nLast time parens at 0: line ${lastZeroParen} (HTML ${lastZeroParen + 1877})`);
    
    let count = 0;
    for (const ev of events) {
        if (ev.line >= lastZeroParen && count < 30) {
            console.log(`  JS:${ev.line} HTML:${ev.line+1877} braces=${ev.braceDepth}(${ev.bd>0?'+':''}${ev.bd}) parens=${ev.parenDepth}(${ev.pd>0?'+':''}${ev.pd}) | ${ev.text}`);
            count++;
        }
    }
}
