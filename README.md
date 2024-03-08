# queryings-api

- Base URL: http://localhost:8080

## REST

### Suggestions

- Endpoint: `/get-queries`
- Query param: `q=<string>`

> http://localhost:8080/get-queries?q=cat

### Trendings

- Endpoint: `/get-trending`
- Query param:
  - `geolocation=<string>` (Optional) (Default: US)
  - `date=<string>` (Optional) (Default: Today)
  - `extended=<boolean>` (Optional)

> http://localhost:8080/get-trending?geolocation=CH&date=2024-01-01&extended=true

- Endpoint: `/get-trendings`
- Query param:
  - `geolocation=<string>` (Optional) (Default: US)
  - `extended=<boolean>` (Optional)

> http://localhost:8080/get-trendings?geolocation=CH&extended=true

## GraphQL

_Same as above but allow specific fields picking_

### Query

- Endpoint: `/graphql`
- Variables: `{ "query": "string" }`

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
