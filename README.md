# queryings-api

## REST

- Base URL: http://localhost:8080
- Endpoint: `/api/query`
- Query param: `q=<keyword>`

```
http://localhost:8080/api/query?q=cat
```

## GraphQL

*Same as above but allow specific fields picking*

### Query

Base URL: http://localhost:8080/graphql

```graphql
query getSuggestions($query: String!) {
  suggestions(query: $query) {
    name
    children {
      alphabeticals {
        a
        b
        c
        d
        e
        f
        g
        h
        i
        j
        k
        l
        m
        n
        o
        p
        q
        r
        s
        t
        u
        v
        w
        x
        y
        z
        asterisk
      }
      comparisons {
        against
        and
        like
        or
        versus
        vs
      }
      prepositions {
        for
        is
        near
        to
        with
        without
      }
      questions {
        are
        can
        how
        howLong
        howOften
        what
        when
        where
        which
        who
        why
        will
      }
    }
  }
}
```

### Variables

```graphql
{
    "query": "cat"
}
```
