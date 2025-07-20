#!/bin/bash

# Zone.Identifier Cleanup Script for AmaChess
# This script removes all Windows Zone.Identifier files from the codebase

echo "🧹 Starting Zone.Identifier cleanup for AmaChess..."
echo "================================================="

# Get the script directory (where the script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Count Zone.Identifier files before cleanup
echo "📊 Counting Zone.Identifier files..."
TOTAL_FILES=$(find "$SCRIPT_DIR" -name "*:Zone.Identifier" -type f 2>/dev/null | wc -l)
echo "Found $TOTAL_FILES Zone.Identifier files to remove"

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo "✅ No Zone.Identifier files found. Cleanup not needed."
    exit 0
fi

echo ""
echo "🗑️  Removing Zone.Identifier files..."

# Remove all Zone.Identifier files
REMOVED_COUNT=0
while IFS= read -r -d '' file; do
    if rm "$file" 2>/dev/null; then
        ((REMOVED_COUNT++))
        echo "Removed: $file"
    else
        echo "❌ Failed to remove: $file"
    fi
done < <(find "$SCRIPT_DIR" -name "*:Zone.Identifier" -type f -print0 2>/dev/null)

echo ""
echo "📈 Cleanup Summary:"
echo "=================="
echo "Total files found: $TOTAL_FILES"
echo "Files removed: $REMOVED_COUNT"
echo "Failed removals: $((TOTAL_FILES - REMOVED_COUNT))"

if [ "$REMOVED_COUNT" -eq "$TOTAL_FILES" ]; then
    echo "✅ All Zone.Identifier files successfully removed!"
else
    echo "⚠️  Some files could not be removed. Check permissions."
fi

# Verify cleanup
echo ""
echo "🔍 Verifying cleanup..."
REMAINING_FILES=$(find "$SCRIPT_DIR" -name "*:Zone.Identifier" -type f 2>/dev/null | wc -l)
if [ "$REMAINING_FILES" -eq 0 ]; then
    echo "✅ Verification complete: No Zone.Identifier files remaining"
else
    echo "⚠️  Warning: $REMAINING_FILES Zone.Identifier files still remain"
fi

echo ""
echo "🎉 Zone.Identifier cleanup complete!"
