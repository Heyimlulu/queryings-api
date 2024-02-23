const typeDefs = `
  type Query {
    suggestions(query: String!): Suggestions!
  }

  type Suggestions {
    name: String!
    children: Children!
  }

  type Children {
    questions: Questions!
    prepositions: Prepositions!
    comparisons: Comparisons!
    alphabeticals: Alphabeticals!
  }

  type Questions {
    can: [String!]!
    why: [String!]!
    who: [String!]!
    which: [String!]!
    will: [String!]!
    how: [String!]!
    what: [String!]!
    where: [String!]!
    are: [String!]!
    when: [String!]!
    howOften: [String!]!
    howLong: [String!]!
  }

  type Prepositions {
    near: [String!]!
    without: [String!]!
    to: [String!]!
    with: [String!]!
    is: [String!]!
    for: [String!]!
  }

  type Comparisons {
    like: [String!]!
    versus: [String!]!
    vs: [String!]!
    and: [String!]!
    or: [String!]!
    against: [String!]!
  }

  type Alphabeticals {
    a: [String!]!
    b: [String!]!
    c: [String!]!
    d: [String!]!
    e: [String!]!
    f: [String!]!
    g: [String!]!
    h: [String!]!
    i: [String!]!
    j: [String!]!
    k: [String!]!
    l: [String!]!
    m: [String!]!
    n: [String!]!
    o: [String!]!
    p: [String!]!
    q: [String!]!
    r: [String!]!
    s: [String!]!
    t: [String!]!
    u: [String!]!
    v: [String!]!
    w: [String!]!
    x: [String!]!
    y: [String!]!
    z: [String!]!
    asterisk: [String!]!
  }
`;

export default typeDefs;
