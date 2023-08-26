const tilemap="data:image/png;base64,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";
