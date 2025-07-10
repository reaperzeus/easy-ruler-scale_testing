Hooks.on("init", () => {
  game.settings.register("easy-ruler-scale-testing", "scaling", {
    name: "Ruler Scale",
    scope: "client",
    config: true,
    default: 100,
    type: Number,
  });
})

const ERS = "easy-ruler-scale-testing"
Hooks.once('init', async function () {
  libWrapper.register(ERS, "foundry.canvas.interaction.Ruler.prototype._drawMeasuredPath", _newDrawMeasuredPath, "OVERRIDE")
  if (game.modules.get('drag-ruler')?.active) libWrapper.register(ERS, "CONFIG.Canvas.rulerClass.prototype._drawMeasuredPath", dragRuler_newDrawMeasuredPath, "OVERRIDE");
});

function _newDrawMeasuredPath() {
  const r = this.ruler.beginFill(this.color, 0.25);
  for (const segment of this.segments) {
    const { ray, distance, label, last } = segment;
    if (distance === 0) continue;

    // Draw Line
    r.moveTo(ray.A.x, ray.A.y).lineStyle(6, 0x000000, 0.5).lineTo(ray.B.x, ray.B.y)
      .lineStyle(4, this.color, 0.25).moveTo(ray.A.x, ray.A.y).lineTo(ray.B.x, ray.B.y);

    // Draw Waypoints
    r.lineStyle(2, 0x000000, 0.5).drawCircle(ray.A.x, ray.A.y, 8);
    if (last) r.drawCircle(ray.B.x, ray.B.y, 8);

    // Draw Label
    if (label) {
      const text = this._getSegmentLabel(segment, this.totalDistance);
      if (text) {
        label.text = text;
        label.alpha = last ? 1.0 : 0.5;
        label.visible = true;
        let labelPosition = ray.project((ray.distance + 50) / ray.distance);
        label.position.set(labelPosition.x, labelPosition.y);
        let scale = game.settings.get("easy-ruler-scale", "scaling")
        let gs = (canvas.scene.dimensions.size / 100)
        let zs = 1 / canvas.stage.scale.x
        label.transform.scale.set((gs + zs) * (scale / 100))
      }
      else label.visible = false;
    }
  }
  r.endFill();
}

function dragRuler_newDrawMeasuredPath() {
  if (!this.isDragRuler) {
    // return this.super._drawMeasuredPath();
    return _newDrawMeasuredPath.call(this);
  }
  let rulerColor = this.color;
  if (!this.dragRulerGridSpaces || canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
    const totalDistance = this.segments.reduce((total, current) => total + current.distance, 0);
    rulerColor = this.dragRulerGetColorForDistance(totalDistance);
  }
  const r = this.ruler.beginFill(rulerColor, 0.25);
  for (const segment of this.dragRulerUnsnappedSegments) {
    const opacityMultiplier = segment.ray.isPrevious ? 0.33 : 1;
    const { ray, distance, label, text, last } = segment;
    if (distance === 0) continue;

    // Draw Line
    r.moveTo(ray.A.x, ray.A.y)
      .lineStyle(6, 0x000000, 0.5 * opacityMultiplier)
      .lineTo(ray.B.x, ray.B.y)
      .lineStyle(4, rulerColor, 0.25 * opacityMultiplier)
      .moveTo(ray.A.x, ray.A.y)
      .lineTo(ray.B.x, ray.B.y);

    // Draw Waypoints
    r.lineStyle(2, 0x000000, 0.5).drawCircle(ray.A.x, ray.A.y, 8);
    if (last) r.drawCircle(ray.B.x, ray.B.y, 8);

    // Draw Label
    if (label) {
      label.text = text;
      label.alpha = last ? 1.0 : 0.5;
      label.visible = true;
      let labelPosition = ray.project((ray.distance + 50) / ray.distance);
      label.position.set(labelPosition.x, labelPosition.y);
      let scale = game.settings.get("easy-ruler-scale-testing", "scaling")
      let gs = (canvas.scene.dimensions.size / 100)
      let zs = 1 / canvas.stage.scale.x
      label.transform.scale.set((gs + zs) * (scale / 100))

    }
  }
  r.endFill();

}
