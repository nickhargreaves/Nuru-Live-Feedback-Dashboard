/*
	Leaflet.label, a plugin that adds labels to markers and vectors for Leaflet powered maps.
	(c) 2012-2013, Jacob Toye, Smartrak

	https://github.com/Leaflet/Leaflet.label
	http://leafletjs.com
	https://github.com/jacobtoye
*/
(function () {
	L.labelVersion = "0.2.2-dev", L.Label = L.Class.extend({
		/*includes:L.Mixin.Events,*/
		options: {
			className: "",
			clickable: !1,
			direction: "right",
			noHide: !1,
			offset: [12, -15],
			opacity: 1,
			zoomAnimation: !0
		},
		initialize: function (t, e) {
			L.setOptions(this, t), this._source = e, this._animated = L.Browser.any3d && this.options.zoomAnimation, this._isOpen = !1
		},
		onAdd: function (t) {
			this._map = t, this._pane = this._source instanceof L.Marker ? t._panes.markerPane : t._panes.popupPane, this._container || this._initLayout(), this._pane.appendChild(this._container), this._initInteraction(), this._update(), this.setOpacity(this.options.opacity), t.on("moveend", this._onMoveEnd, this).on("viewreset", this._onViewReset, this), this._animated && t.on("zoomanim", this._zoomAnimation, this), L.Browser.touch && !this.options.noHide && L.DomEvent.on(this._container, "click", this.close, this)
		},
		onRemove: function (t) {
			this._pane.removeChild(this._container), t.off({
				zoomanim: this._zoomAnimation,
				moveend: this._onMoveEnd,
				viewreset: this._onViewReset
			}, this), this._removeInteraction(), this._map = null
		},
		setLatLng: function (t) {
			return this._latlng = L.latLng(t), this._map && this._updatePosition(), this
		},
		setContent: function (t) {
			return this._previousContent = this._content, this._content = t, this._updateContent(), this
		},
		close: function () {
			var t = this._map;
			t && (L.Browser.touch && !this.options.noHide && L.DomEvent.off(this._container, "click", this.close), t.removeLayer(this))
		},
		updateZIndex: function (t) {
			this._zIndex = t, this._container && this._zIndex && (this._container.style.zIndex = t)
		},
		setOpacity: function (t) {
			this.options.opacity = t, this._container && L.DomUtil.setOpacity(this._container, t)
		},
		_initLayout: function () {
			this._container = L.DomUtil.create("div", "leaflet-label " + this.options.className + " leaflet-zoom-animated"), this.updateZIndex(this._zIndex)
		},
		_update: function () {
			this._map && (this._container.style.visibility = "hidden", this._updateContent(), this._updatePosition(), this._container.style.visibility = "")
		},
		_updateContent: function () {
			this._content && this._map && this._prevContent !== this._content && "string" == typeof this._content && (this._container.innerHTML = this._content, this._prevContent = this._content, this._labelWidth = this._container.offsetWidth)
		},
		_updatePosition: function () {
			var t = this._map.latLngToLayerPoint(this._latlng);
			this._setPosition(t)
		},
		_setPosition: function (t) {
			var e = this._map,
				i = this._container,
				n = e.latLngToContainerPoint(e.getCenter()),
				o = e.layerPointToContainerPoint(t),
				s = this.options.direction,
				a = this._labelWidth,
				l = L.point(this.options.offset);
			"right" === s || "auto" === s && o.x < n.x ? (L.DomUtil.addClass(i, "leaflet-label-right"), L.DomUtil.removeClass(i, "leaflet-label-left"), t = t.add(l)) : (L.DomUtil.addClass(i, "leaflet-label-left"), L.DomUtil.removeClass(i, "leaflet-label-right"), t = t.add(L.point(-l.x - a, l.y))), L.DomUtil.setPosition(i, t)
		},
		_zoomAnimation: function (t) {
			var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center).round();
			this._setPosition(e)
		},
		_onMoveEnd: function () {
			this._animated && "auto" !== this.options.direction || this._updatePosition()
		},
		_onViewReset: function (t) {
			t && t.hard && this._update()
		},
		_initInteraction: function () {
			if (this.options.clickable) {
				var t = this._container,
					e = ["dblclick", "mousedown", "mouseover", "mouseout", "contextmenu"];
				L.DomUtil.addClass(t, "leaflet-clickable"), L.DomEvent.on(t, "click", this._onMouseClick, this);
				for (var i = 0; e.length > i; i++) L.DomEvent.on(t, e[i], this._fireMouseEvent, this)
			}
		},
		_removeInteraction: function () {
			if (this.options.clickable) {
				var t = this._container,
					e = ["dblclick", "mousedown", "mouseover", "mouseout", "contextmenu"];
				L.DomUtil.removeClass(t, "leaflet-clickable"), L.DomEvent.off(t, "click", this._onMouseClick, this);
				for (var i = 0; e.length > i; i++) L.DomEvent.off(t, e[i], this._fireMouseEvent, this)
			}
		},
		_onMouseClick: function (t) {
			this.hasEventListeners(t.type) && L.DomEvent.stopPropagation(t), this.fire(t.type, {
				originalEvent: t
			})
		},
		_fireMouseEvent: function (t) {
			this.fire(t.type, {
				originalEvent: t
			}), "contextmenu" === t.type && this.hasEventListeners(t.type) && L.DomEvent.preventDefault(t), "mousedown" !== t.type ? L.DomEvent.stopPropagation(t) : L.DomEvent.preventDefault(t)
		}
	}), L.BaseMarkerMethods = {
		showLabel: function () {
			return this.label && this._map && (this.label.setLatLng(this._latlng), this._map.showLabel(this.label)), this
		},
		hideLabel: function () {
			return this.label && this.label.close(), this
		},
		setLabelNoHide: function (t) {
			this._labelNoHide !== t && (this._labelNoHide = t, t ? (this._removeLabelRevealHandlers(), this.showLabel()) : (this._addLabelRevealHandlers(), this.hideLabel()))
		},
		bindLabel: function (t, e) {
			var i = this.options.icon ? this.options.icon.options.labelAnchor : this.options.labelAnchor,
				n = L.point(i) || L.point(0, 0);
			return n = n.add(L.Label.prototype.options.offset), e && e.offset && (n = n.add(e.offset)), e = L.Util.extend({
				offset: n
			}, e), this._labelNoHide = e.noHide, this.label || (this._labelNoHide || this._addLabelRevealHandlers(), this.on("remove", this.hideLabel, this).on("move", this._moveLabel, this).on("add", this._onMarkerAdd, this), this._hasLabelHandlers = !0), this.label = new L.Label(e, this).setContent(t), this
		},
		unbindLabel: function () {
			return this.label && (this.hideLabel(), this.label = null, this._hasLabelHandlers && (this._labelNoHide || this._removeLabelRevealHandlers(), this.off("remove", this.hideLabel, this).off("move", this._moveLabel, this).off("add", this._onMarkerAdd, this)), this._hasLabelHandlers = !1), this
		},
		updateLabelContent: function (t) {
			this.label && this.label.setContent(t)
		},
		getLabel: function () {
			return this.label
		},
		_onMarkerAdd: function () {
			this._labelNoHide && this.showLabel()
		},
		_addLabelRevealHandlers: function () {
			this.on("mouseover", this.showLabel, this).on("mouseout", this.hideLabel, this), L.Browser.touch && this.on("click", this.showLabel, this)
		},
		_removeLabelRevealHandlers: function () {
			this.off("mouseover", this.showLabel, this).off("mouseout", this.hideLabel, this), L.Browser.touch && this.off("click", this.showLabel, this)
		},
		_moveLabel: function (t) {
			this.label.setLatLng(t.latlng)
		}
	}, L.Icon.Default.mergeOptions({
		labelAnchor: new L.Point(9, -20)
	}), L.Marker.mergeOptions({
		icon: new L.Icon.Default
	}), L.Marker.include(L.BaseMarkerMethods), L.Marker.include({
		_originalUpdateZIndex: L.Marker.prototype._updateZIndex,
		_updateZIndex: function (t) {
			var e = this._zIndex + t;
			this._originalUpdateZIndex(t), this.label && this.label.updateZIndex(e)
		},
		_originalSetOpacity: L.Marker.prototype.setOpacity,
		setOpacity: function (t, e) {
			this.options.labelHasSemiTransparency = e, this._originalSetOpacity(t)
		},
		_originalUpdateOpacity: L.Marker.prototype._updateOpacity,
		_updateOpacity: function () {
			var t = 0 === this.options.opacity ? 0 : 1;
			this._originalUpdateOpacity(), this.label && this.label.setOpacity(this.options.labelHasSemiTransparency ? this.options.opacity : t)
		},
		_originalSetLatLng: L.Marker.prototype.setLatLng,
		setLatLng: function (t) {
			return this.label && !this._labelNoHide && this.hideLabel(), this._originalSetLatLng(t)
		}
	}), L.CircleMarker.mergeOptions({
		labelAnchor: new L.Point(0, 0)
	}), L.CircleMarker.include(L.BaseMarkerMethods), L.Path.include({
		bindLabel: function (t, e) {
			return this.label && this.label.options === e || (this.label = new L.Label(e, this)), this.label.setContent(t), this._showLabelAdded || (this.on("mouseover", this._showLabel, this).on("mousemove", this._moveLabel, this).on("mouseout remove", this._hideLabel, this), L.Browser.touch && this.on("click", this._showLabel, this), this._showLabelAdded = !0), this
		},
		unbindLabel: function () {
			return this.label && (this._hideLabel(), this.label = null, this._showLabelAdded = !1, this.off("mouseover", this._showLabel, this).off("mousemove", this._moveLabel, this).off("mouseout remove", this._hideLabel, this)), this
		},
		updateLabelContent: function (t) {
			this.label && this.label.setContent(t)
		},
		_showLabel: function (t) {
			this.label.setLatLng(t.latlng), this._map.showLabel(this.label)
		},
		_moveLabel: function (t) {
			this.label.setLatLng(t.latlng)
		},
		_hideLabel: function () {
			this.label.close()
		}
	}), L.Map.include({
		showLabel: function (t) {
			return this.addLayer(t)
		}
	}), L.FeatureGroup.include({
		clearLayers: function () {
			return this.unbindLabel(), this.eachLayer(this.removeLayer, this), this
		},
		bindLabel: function (t, e) {
			return this.invoke("bindLabel", t, e)
		},
		unbindLabel: function () {
			return this.invoke("unbindLabel")
		},
		updateLabelContent: function (t) {
			this.invoke("updateLabelContent", t)
		}
	})
})(this, document);
