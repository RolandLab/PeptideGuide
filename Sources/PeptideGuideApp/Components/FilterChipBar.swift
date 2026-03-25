import SwiftUI

struct FilterChipBar: View {
    let tags: [String]
    let selected: Set<String>
    let onToggle: (String) -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppSpacing.xs) {
                ForEach(tags, id: \.self) { tag in
                    TagChip(label: tag, isSelected: selected.contains(tag)) {
                        onToggle(tag)
                    }
                }
            }
            .padding(.vertical, 2)
        }
    }
}
