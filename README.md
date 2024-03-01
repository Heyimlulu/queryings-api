# queryings-api

- Base URL: http://localhost:8080

## REST

- Endpoint: `/get-queries`
- Query param: `q=<keyword>`

```
http://localhost:8080/get-queries?q=cat
```

## GraphQL

_Same as above but allow specific fields picking_

### Query

- Endpoint: `/graphql`
- Variables: `{ "query": "cat" }`

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
