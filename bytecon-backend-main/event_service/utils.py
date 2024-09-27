    

import base64
from api.schema import Tags


def edit_distance(event_name: str, search: str) -> int:
    event_name, search = event_name.lower(), search.lower()
    rows, cols = len(event_name), len(search)

    dp = [ [0] * (cols + 1) for _ in range(rows + 1) ]
    for i in range(rows):
        dp[i][cols] = rows - i
    for i in range(cols):
        dp[rows][i] = cols - i

    for row in range(rows - 1, -1, -1):
        for col in range(cols - 1, -1, -1):
            replace = 1
            if event_name[row] == search[col]:
                replace = 0
            dp[row][col] = min(dp[row + 1][col + 1] + replace, dp[row + 1][col] + 1, dp[row][col + 1] + 1)
    return dp[0][0]


def tag_relevance(event_tags: list[Tags], search_tags: list[Tags]) -> int:
    stored_tags, tags_set = set(event_tags), set(search_tags)
    return len(stored_tags & tags_set)

def b64_encode(input: str):
    return base64.b64encode(input.encode()).decode()