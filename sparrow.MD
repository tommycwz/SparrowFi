# .spw File Format Specification

The `.spw` file is a custom binary format used by SparrowFi to persist user data securely offline.

## File Structure

The file consists of a magic header followed by the payload.

| Offset | Size (Bytes) | Type | Description |
| :--- | :--- | :--- | :--- |
| `0x00` | 4 | ASCII String | Magic Header: `SPW2` (or `SPW1` for legacy files) |
| `0x04` | Variable | Binary Data | The XOR-obfuscated JSON payload. |

### Header

The first 4 bytes of every `.spw` file must be `SPW2` encoded in ASCII. The application also supports reading legacy `SPW1` files for backwards compatibility.

### Payload

The payload starts immediately after the 4-byte header.
In `SPW2` format, the payload is a binary string resulting from a byte-wise XOR operation on the UTF-8 encoded JSON payload using a fixed key of `0x53` ('S'). This ensures the file is non-human readable in text editors.

#### JSON State Schema (Prior to XOR Obfuscation)

```json
{
  "user": {
    "isNew": false,
    "lastExport": "2023-10-27T10:00:00Z"
  },
  "settings": {
    "currency": "myr"
  },
  "banks": [
    {
      "id": "uuid-string",
      "name": "Bank Name",
      "initialCapital": 10000
    }
  ],
  "cards": [
    {
      "id": "uuid-string",
      "name": "Card Name"
    }
  ],
  "categories": [
    {
      "id": "uuid-string",
      "name": "Food and Drink"
    }
  ],
  "transactions": [
    {
      "id": "uuid-string",
      "date": "2023-10-27",
      "amount": 50.25,
      "type": "expense",
      "accountType": "bank",
      "accountId": "uuid-string",
      "categoryId": "uuid-string",
      "notes": "Lunch with team"
    }
  ]
}
```

## Serialization and Deserialization

### Exporting (SPW2)
1. Serialize the state object to a JSON string.
2. Encode the JSON string into a `Uint8Array` using `TextEncoder`.
3. Apply a byte-wise XOR cipher to the array using the key `0x53`.
4. Prepend the `SPW2` header bytes (e.g., `[83, 80, 87, 50]`).
5. Save the combined byte array as a `Blob` and prompt the user to download it.

### Importing (SPW2)
1. Read the file as an `ArrayBuffer` using `FileReader`.
2. Verify the first 4 bytes match `SPW2` (or `SPW1`).
3. If `SPW2`, apply the XOR cipher with `0x53` to the payload bytes to decode them back to their UTF-8 encoding.
4. Decode the bytes using `TextDecoder('utf-8')`.
5. Parse the resulting JSON string back into the application state.
