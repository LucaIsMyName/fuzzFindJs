# FQL - Fuzzy Query Language

**Version:** 1.0.0  
**Status:** Beta

---

## 📖 Overview

FQL (Fuzzy Query Language) is a powerful query language for advanced fuzzy search operations. It provides logical operators, filters, field selectors, and more to build complex search queries.

### Key Features

- 🔍 **Logical Operators** - AND, OR, NOT for complex logic
- 🎯 **Match Type Filters** - EXACT, FUZZY, PHONETIC, PREFIX, REGEX, COMPOUND
- 📊 **Field Selectors** - Search specific fields in multi-field data
- ⚖️ **Score Filters** - Filter by match confidence
- 🌍 **Language Filters** - Search in specific languages
- 🔒 **Type-Safe** - Full TypeScript support
- ⚡ **Opt-In** - Requires explicit activation

---

## 🚀 Quick Start

```typescript
import { buildFuzzyIndex, getSuggestions } from 'fuzzyfindjs';

const index = buildFuzzyIndex(['Dr. Müller', 'Dr. Schmidt', 'Nurse Johnson']);

// Enable FQL with enableFQL: true
const results = getSuggestions(
  index,
  'fql(doctor AND müller)',
  10,
  { enableFQL: true }
);
```

---

## 📝 Syntax Reference

### Basic Syntax

FQL queries must be wrapped in `fql()`:

```typescript
fql(query_expression)
```

### Operators

#### **AND Operator**
All terms must match (intersection)

```typescript
fql(term1 AND term2)
fql(müller AND berlin)
fql(doctor AND berlin AND specialist)
```

#### **OR Operator**
Any term can match (union)

```typescript
fql(term1 OR term2)
fql(müller OR schmidt)
fql(doctor OR physician OR medic)
```

#### **NOT Operator**
Exclude terms (exclusion)

```typescript
fql(NOT term)
fql(doctor NOT dentist)
fql(müller NOT berlin)
```

#### **Grouping with Parentheses**
Control operator precedence

```typescript
fql((müller OR schmidt) AND berlin)
fql(doctor AND (berlin OR munich) NOT dentist)
fql((term1 OR term2) AND (term3 OR term4))
```

**Operator Precedence:** NOT > AND > OR

---

### Match Type Filters

#### **EXACT** - Exact matches only
```typescript
fql(EXACT:müller)
fql(EXACT:"New York")
```

#### **FUZZY** - Fuzzy matches (typo-tolerant)
```typescript
fql(FUZZY:muller)  // Matches "Müller", "Miller"
fql(FUZZY:docter)  // Matches "doctor"
```

#### **PHONETIC** - Phonetic matches
```typescript
fql(PHONETIC:shule)   // Matches "Schule"
fql(PHONETIC:smyth)   // Matches "Smith"
```

#### **PREFIX** - Prefix matches
```typescript
fql(PREFIX:doc)       // Matches "doctor", "document"
fql(PREFIX:ber)       // Matches "Berlin", "Bernard"
```

#### **REGEX** - Regular expression (must enable)
```typescript
fql(REGEX:^Dr\\..*Smith$)
fql(REGEX:.*müller.*i)  // Case-insensitive flag
```

**Note:** Regex requires `fqlOptions.allowRegex: true`

#### **COMPOUND** - Compound word matches (German)
```typescript
fql(COMPOUND:kranken)     // Matches "Krankenhaus"
fql(COMPOUND:haus)        // Matches "Krankenhaus", "Rathaus"
```

---

### Field Selectors

Search specific fields in multi-field data:

```typescript
fql(field:value)
fql(name:müller)
fql(city:berlin AND name:schmidt)
fql(title:"senior developer" OR description:python)
```

**Combine with filters:**
```typescript
fql(name:FUZZY:muller)
fql(city:EXACT:berlin)
fql(role:PREFIX:dev)
```

---

### Score Filters

Filter by match confidence (0.0 - 1.0):

```typescript
fql(term SCORE>0.8)
fql(term SCORE>=0.7)
fql(term SCORE<0.5)
fql(term SCORE<=0.9)
```

**Combine with other operators:**
```typescript
fql((doctor OR physician) SCORE>0.7)
fql(FUZZY:muller SCORE>=0.8)
```

---

### Language Filters

Search in specific language:

```typescript
fql(LANG:german müller)
fql(LANG:french café)
fql(LANG:spanish niño)
```

---

## 💡 Examples

### Example 1: Find Doctors in Berlin or Munich
```typescript
const doctors = [
  'Dr. Müller - Berlin',
  'Dr. Schmidt - Munich',
  'Dentist Weber - Berlin',
  'Dr. Johnson - Hamburg'
];

const index = buildFuzzyIndex(doctors);

const results = getSuggestions(
  index,
  'fql((doctor OR dr) AND (berlin OR munich) NOT dentist)',
  10,
  { enableFQL: true }
);
// → ['Dr. Müller - Berlin', 'Dr. Schmidt - Munich']
```

### Example 2: Exact Product Search
```typescript
const products = [
  'iPhone 15 Pro',
  'iPhone 15',
  'Samsung Galaxy S23',
  'iPad Pro'
];

const index = buildFuzzyIndex(products);

const results = getSuggestions(
  index,
  'fql(EXACT:"iPhone 15" OR EXACT:"Samsung Galaxy")',
  10,
  { enableFQL: true }
);
// → ['iPhone 15', 'Samsung Galaxy S23']
```

### Example 3: Multi-Field Search
```typescript
const employees = [
  { name: 'Müller', city: 'Berlin', role: 'Developer' },
  { name: 'Schmidt', city: 'Munich', role: 'Designer' },
  { name: 'Weber', city: 'Berlin', role: 'Developer' }
];

const index = buildFuzzyIndex(employees, {
  fields: ['name', 'city', 'role']
});

const results = getSuggestions(
  index,
  'fql(city:berlin AND role:developer)',
  10,
  { enableFQL: true }
);
// → [{ name: 'Müller', city: 'Berlin', role: 'Developer' }, ...]
```

### Example 4: Fuzzy Search with Score Filter
```typescript
const index = buildFuzzyIndex(['Müller', 'Miller', 'Möller', 'Mueller']);

const results = getSuggestions(
  index,
  'fql(FUZZY:muller SCORE>0.8)',
  10,
  { enableFQL: true }
);
// → High-confidence matches only
```

### Example 5: Complex Query
```typescript
const results = getSuggestions(
  index,
  'fql((name:FUZZY:muller OR name:schmidt) AND (city:berlin OR city:munich) AND role:PREFIX:dev NOT role:intern SCORE>0.7)',
  10,
  { enableFQL: true }
);
```

### Example 6: Phonetic Search
```typescript
const index = buildFuzzyIndex(['Schule', 'Schmidt', 'Schulz']);

const results = getSuggestions(
  index,
  'fql(PHONETIC:shule)',
  10,
  { enableFQL: true }
);
// → ['Schule', 'Schulz'] (phonetically similar)
```

---

## ⚙️ Configuration

### Enable FQL

FQL is **opt-in** and must be explicitly enabled:

```typescript
const results = getSuggestions(
  index,
  'fql(query)',
  10,
  { 
    enableFQL: true  // Required!
  }
);
```

### FQL Options

```typescript
interface SearchOptions {
  enableFQL?: boolean;
  
  fqlOptions?: {
    /** Allow regex patterns (default: false) */
    allowRegex?: boolean;
    
    /** Timeout for query execution in ms (default: 5000) */
    timeout?: number;
  };
}
```

**Example:**
```typescript
const results = getSuggestions(
  index,
  'fql(REGEX:^Dr\\..*)',
  10,
  { 
    enableFQL: true,
    fqlOptions: {
      allowRegex: true,
      timeout: 10000
    }
  }
);
```

---

## 🎯 Grammar Reference

```
expression     → or_expr
or_expr        → and_expr ( OR and_expr )*
and_expr       → not_expr ( AND not_expr )*
not_expr       → NOT? primary
primary        → filter | field | score | lang | term | phrase | grouped
grouped        → LPAREN expression RPAREN
filter         → (EXACT|FUZZY|PHONETIC|PREFIX|REGEX|COMPOUND) COLON value
field          → TERM COLON expression
score          → expression SCORE (>|<|>=|<=) NUMBER
lang           → LANG COLON TERM expression
term           → TERM
phrase         → QUOTED_STRING
```

---

## 🔒 Security & Best Practices

### 1. Regex Safety

Regex patterns can be slow. Enable only when needed:

```typescript
fqlOptions: {
  allowRegex: true  // Default: false
}
```

### 2. Query Timeout

Prevent long-running queries:

```typescript
fqlOptions: {
  timeout: 5000  // 5 seconds (default)
}
```

### 3. Input Validation

Always validate user input before passing to FQL:

```typescript
function sanitizeFQLQuery(query: string): string {
  // Remove potentially dangerous patterns
  // Validate syntax before execution
  return query.trim();
}
```

### 4. Error Handling

Handle FQL errors gracefully:

```typescript
try {
  const results = getSuggestions(index, 'fql(invalid)', 10, { enableFQL: true });
} catch (error) {
  if (error instanceof FQLSyntaxError) {
    console.error('Syntax error:', error.message);
    console.error('At position:', error.position);
  } else if (error instanceof FQLTimeoutError) {
    console.error('Query timeout');
  }
}
```

---

## 📊 Performance

### Query Complexity

- **Simple queries** (1-2 terms): <1ms
- **Medium queries** (3-5 terms, 1-2 operators): 1-5ms
- **Complex queries** (5+ terms, multiple operators): 5-20ms
- **Regex queries**: 10-100ms (depends on pattern)

### Optimization Tips

1. **Use specific filters** - `EXACT:term` is faster than `FUZZY:term`
2. **Limit OR branches** - Too many OR terms slow down search
3. **Use field selectors** - Narrow search scope early
4. **Avoid complex regex** - Simple patterns are faster
5. **Apply score filters** - Reduce result set size

---

## 🐛 Error Messages

### Syntax Errors

```typescript
// Missing closing parenthesis
fql((term1 AND term2)
// → Error: Expected ')' at position 20

// Invalid operator
fql(term1 XOR term2)
// → Error: Unknown operator 'XOR' at position 6

// Unclosed quote
fql("term1)
// → Error: Unclosed quote at position 4
```

### Runtime Errors

```typescript
// Regex not enabled
fql(REGEX:pattern)
// → Error: Regex not enabled. Set fqlOptions.allowRegex = true

// Query timeout
fql(very complex query...)
// → Error: Query execution timeout after 5000ms

// Invalid field
fql(nonexistent:value)
// → Error: Field 'nonexistent' not found in index
```

---

## 🔄 Migration Guide

### From Regular Search to FQL

**Before:**
```typescript
getSuggestions(index, 'müller', 10);
```

**After:**
```typescript
getSuggestions(index, 'fql(müller)', 10, { enableFQL: true });
```

### From Phrase Search to FQL

**Before:**
```typescript
getSuggestions(index, '"new york"', 10);
```

**After:**
```typescript
getSuggestions(index, 'fql(EXACT:"new york")', 10, { enableFQL: true });
```

### Combining Features

You can still use regular search when FQL is enabled:

```typescript
// Regular search (no fql() wrapper)
getSuggestions(index, 'müller', 10, { enableFQL: true });

// FQL search (with fql() wrapper)
getSuggestions(index, 'fql(müller AND berlin)', 10, { enableFQL: true });
```

---

## 📚 Advanced Topics

### Custom Filters

You can combine filters for powerful queries:

```typescript
// Fuzzy match with high confidence in specific field
fql(name:FUZZY:muller SCORE>0.9)

// Phonetic match in German language
fql(LANG:german PHONETIC:shule)

// Prefix match excluding certain terms
fql(PREFIX:doc NOT document)
```

### Query Composition

Build queries programmatically:

```typescript
function buildDoctorQuery(city: string, specialty?: string): string {
  let query = 'fql(doctor AND ' + city;
  if (specialty) {
    query += ' AND ' + specialty;
  }
  query += ')';
  return query;
}

const results = getSuggestions(
  index,
  buildDoctorQuery('berlin', 'cardiologist'),
  10,
  { enableFQL: true }
);
```

---

## 🎓 Learning Path

1. **Start Simple** - Use basic AND, OR, NOT operators
2. **Add Filters** - Try EXACT, FUZZY, PREFIX filters
3. **Use Fields** - Search specific fields in your data
4. **Score Filtering** - Refine results by confidence
5. **Complex Queries** - Combine everything with grouping

---

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue!

---

## 📄 License

MIT License - Same as FuzzyFindJS

---

**Happy Querying!** 🚀
