import AppKit
import Foundation

let arguments = CommandLine.arguments
guard arguments.count > 1 else {
    fputs("Usage: generate_dmg_background.swift <output-file>\n", stderr)
    exit(1)
}

let outputURL = URL(fileURLWithPath: arguments[1])
let size = NSSize(width: 960, height: 600)
guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(size.width),
    pixelsHigh: Int(size.height),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
) else {
    fputs("Failed to allocate bitmap\n", stderr)
    exit(1)
}

NSGraphicsContext.saveGraphicsState()
guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
    fputs("Failed to create graphics context\n", stderr)
    exit(1)
}
NSGraphicsContext.current = context

let rect = NSRect(origin: .zero, size: size)
let gradient = NSGradient(colors: [
    NSColor(calibratedRed: 0.93, green: 0.91, blue: 0.85, alpha: 1.0),
    NSColor(calibratedRed: 0.77, green: 0.84, blue: 0.83, alpha: 1.0),
    NSColor(calibratedRed: 0.61, green: 0.71, blue: 0.72, alpha: 1.0),
])!
gradient.draw(in: rect, angle: -28)

NSColor(calibratedRed: 1.0, green: 1.0, blue: 1.0, alpha: 0.18).setFill()
NSBezierPath(ovalIn: NSRect(x: -70, y: 300, width: 430, height: 430)).fill()

let accentPath = NSBezierPath(roundedRect: NSRect(x: 520, y: 120, width: 420, height: 190), xRadius: 64, yRadius: 64)
let accentTransform = NSAffineTransform()
accentTransform.rotate(byDegrees: -13)
accentPath.transform(using: accentTransform as AffineTransform)
NSColor(calibratedRed: 0.10, green: 0.19, blue: 0.21, alpha: 0.11).setFill()
accentPath.fill()

let titleStyle = NSMutableParagraphStyle()
titleStyle.alignment = .left
let titleAttributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 50, weight: .semibold),
    .foregroundColor: NSColor(calibratedRed: 0.12, green: 0.18, blue: 0.19, alpha: 1.0),
    .paragraphStyle: titleStyle,
]
let bodyAttributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 22, weight: .medium),
    .foregroundColor: NSColor(calibratedRed: 0.18, green: 0.26, blue: 0.28, alpha: 0.82),
    .paragraphStyle: titleStyle,
]

NSString(string: "Peptide Guide").draw(in: NSRect(x: 60, y: 402, width: 360, height: 64), withAttributes: titleAttributes)
NSString(string: "Drag the app into Applications\nto install the Peptide Guide.").draw(in: NSRect(x: 64, y: 318, width: 420, height: 80), withAttributes: bodyAttributes)

context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()

guard let png = bitmap.representation(using: .png, properties: [:]) else {
    fputs("Failed to encode PNG background\n", stderr)
    exit(1)
}

try FileManager.default.createDirectory(at: outputURL.deletingLastPathComponent(), withIntermediateDirectories: true)
try png.write(to: outputURL)
print(outputURL.path)
