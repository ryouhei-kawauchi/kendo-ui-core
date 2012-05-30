namespace Kendo.Mvc.UI
{
    /// <summary>
    /// Defines a generic IRadialScale.
    /// </summary>
    public interface IRadialScale : IGaugeScale
    {
        /// <summary>
        /// The scale end angle.s
        /// </summary>
        double? EndAngle { get; set; }

        /// <summary>
        /// The scale start angle.
        /// </summary>
        double? StartAngle { get; set; }

        /// <summary>
        /// The scale labels.
        /// </summary>
        GaugeRadialScaleLabels Labels { get; set; }
    }
}
