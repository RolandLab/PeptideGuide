import SwiftUI

struct ComparisonRow: View {
    let title: String
    let values: [String]

    var body: some View {
        GridRow {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(AppColors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            ForEach(values.indices, id: \.self) { index in
                Text(values[index])
                    .font(.system(size: 13, weight: .regular))
                    .foregroundStyle(AppColors.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}
