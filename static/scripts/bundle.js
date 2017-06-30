(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(root) {
  'use strict'

  function isValidArray(x) {
    return /Int8Array|Int16Array|Int32Array|Uint8Array|Uint8ClampedArray|Uint16Array|Uint32Array|Float32Array|Float64Array|ArrayBuffer/gi.test(Object.prototype.toString.call(x))
  }

  function arrayBufferConcat(/* arraybuffers */) {
    var arrays = [].slice.call(arguments)

    if (arrays.length <= 0 || !isValidArray(arrays[0])) {
      return new Uint8Array(0).buffer
    }

    var arrayBuffer = arrays.reduce(function(cbuf, buf, i) {
      if (i === 0) return cbuf
      if (!isValidArray(buf)) return cbuf

      var tmp = new Uint8Array(cbuf.byteLength + buf.byteLength)
      tmp.set(new Uint8Array(cbuf), 0)
      tmp.set(new Uint8Array(buf), cbuf.byteLength)

      return tmp.buffer
    }, arrays[0])

    return arrayBuffer
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = arrayBufferConcat
    }
    exports.arrayBufferConcat = arrayBufferConcat
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return arrayBufferConcat
    })
  } else {
    root.arrayBufferConcat = arrayBufferConcat
  }
})(this)

},{}],2:[function(require,module,exports){
const arrayBufferConcat = require('arraybuffer-concat')
const mimes = require('./lib/mimes')

function arrayBufferWithMime(arrayBuffer, mime) {
  let index = mimes.indexOf(mime)
  const uint8 = new Uint8Array(4);
  let i = 0

  while (index > -1 && i <= 4) {
    uint8[i] = index > 256 ? 255 : index

    index -= 255
    i++
  }

  const ab = arrayBufferConcat(uint8, arrayBuffer)

  return ab
}

function arrayBufferMimeDecouple(arrayBufferWithMime) {
  var uint8 = new Uint8Array(arrayBufferWithMime)
  var index = uint8[0] + uint8[1] + uint8[2] + uint8[3]

  var arrayBuffer = uint8.slice(4).buffer

  return {
    mime: mimes[index] || '',
    arrayBuffer: arrayBuffer
  }
}

module.exports = {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
}

},{"./lib/mimes":3,"arraybuffer-concat":1}],3:[function(require,module,exports){
module.exports = [
  "", // blank is intentional
  "application/andrew-inset",
  "application/applixware",
  "application/atom+xml",
  "application/atomcat+xml",
  "application/atomsvc+xml",
  "application/ccxml+xml",
  "application/cdmi-capability",
  "application/cdmi-container",
  "application/cdmi-domain",
  "application/cdmi-object",
  "application/cdmi-queue",
  "application/cu-seeme",
  "application/davmount+xml",
  "application/docbook+xml",
  "application/dssc+der",
  "application/dssc+xml",
  "application/ecmascript",
  "application/emma+xml",
  "application/epub+zip",
  "application/exi",
  "application/font-tdpfr",
  "application/font-woff",
  "application/gml+xml",
  "application/gpx+xml",
  "application/gxf",
  "application/hyperstudio",
  "application/inkml+xml",
  "application/ipfix",
  "application/java-archive",
  "application/java-serialized-object",
  "application/java-vm",
  "application/javascript",
  "application/json",
  "application/jsonml+json",
  "application/lost+xml",
  "application/mac-binhex40",
  "application/mac-compactpro",
  "application/mads+xml",
  "application/marc",
  "application/marcxml+xml",
  "application/mathematica",
  "application/mathml+xml",
  "application/mbox",
  "application/mediaservercontrol+xml",
  "application/metalink+xml",
  "application/metalink4+xml",
  "application/mets+xml",
  "application/mods+xml",
  "application/mp21",
  "application/mp4",
  "application/msword",
  "application/mxf",
  "application/octet-stream",
  "application/oda",
  "application/oebps-package+xml",
  "application/ogg",
  "application/omdoc+xml",
  "application/onenote",
  "application/oxps",
  "application/patch-ops-error+xml",
  "application/pdf",
  "application/pgp-encrypted",
  "application/pgp-signature",
  "application/pics-rules",
  "application/pkcs10",
  "application/pkcs7-mime",
  "application/pkcs7-signature",
  "application/pkcs8",
  "application/pkix-attr-cert",
  "application/pkix-cert",
  "application/pkix-crl",
  "application/pkix-pkipath",
  "application/pkixcmp",
  "application/pls+xml",
  "application/postscript",
  "application/prs.cww",
  "application/pskc+xml",
  "application/rdf+xml",
  "application/reginfo+xml",
  "application/relax-ng-compact-syntax",
  "application/resource-lists+xml",
  "application/resource-lists-diff+xml",
  "application/rls-services+xml",
  "application/rpki-ghostbusters",
  "application/rpki-manifest",
  "application/rpki-roa",
  "application/rsd+xml",
  "application/rss+xml",
  "application/rtf",
  "application/sbml+xml",
  "application/scvp-cv-request",
  "application/scvp-cv-response",
  "application/scvp-vp-request",
  "application/scvp-vp-response",
  "application/sdp",
  "application/set-payment-initiation",
  "application/set-registration-initiation",
  "application/shf+xml",
  "application/smil+xml",
  "application/sparql-query",
  "application/sparql-results+xml",
  "application/srgs",
  "application/srgs+xml",
  "application/sru+xml",
  "application/ssdl+xml",
  "application/ssml+xml",
  "application/tei+xml",
  "application/thraud+xml",
  "application/timestamped-data",
  "application/vnd.3gpp.pic-bw-large",
  "application/vnd.3gpp.pic-bw-small",
  "application/vnd.3gpp.pic-bw-var",
  "application/vnd.3gpp2.tcap",
  "application/vnd.3m.post-it-notes",
  "application/vnd.accpac.simply.aso",
  "application/vnd.accpac.simply.imp",
  "application/vnd.acucobol",
  "application/vnd.acucorp",
  "application/vnd.adobe.air-application-installer-package+zip",
  "application/vnd.adobe.formscentral.fcdt",
  "application/vnd.adobe.fxp",
  "application/vnd.adobe.xdp+xml",
  "application/vnd.adobe.xfdf",
  "application/vnd.ahead.space",
  "application/vnd.airzip.filesecure.azf",
  "application/vnd.airzip.filesecure.azs",
  "application/vnd.amazon.ebook",
  "application/vnd.americandynamics.acc",
  "application/vnd.amiga.ami",
  "application/vnd.android.package-archive",
  "application/vnd.anser-web-certificate-issue-initiation",
  "application/vnd.anser-web-funds-transfer-initiation",
  "application/vnd.antix.game-component",
  "application/vnd.apple.installer+xml",
  "application/vnd.apple.mpegurl",
  "application/vnd.aristanetworks.swi",
  "application/vnd.astraea-software.iota",
  "application/vnd.audiograph",
  "application/vnd.blueice.multipass",
  "application/vnd.bmi",
  "application/vnd.businessobjects",
  "application/vnd.chemdraw+xml",
  "application/vnd.chipnuts.karaoke-mmd",
  "application/vnd.cinderella",
  "application/vnd.claymore",
  "application/vnd.cloanto.rp9",
  "application/vnd.clonk.c4group",
  "application/vnd.cluetrust.cartomobile-config",
  "application/vnd.cluetrust.cartomobile-config-pkg",
  "application/vnd.commonspace",
  "application/vnd.contact.cmsg",
  "application/vnd.cosmocaller",
  "application/vnd.crick.clicker",
  "application/vnd.crick.clicker.keyboard",
  "application/vnd.crick.clicker.palette",
  "application/vnd.crick.clicker.template",
  "application/vnd.crick.clicker.wordbank",
  "application/vnd.criticaltools.wbs+xml",
  "application/vnd.ctc-posml",
  "application/vnd.cups-ppd",
  "application/vnd.curl.car",
  "application/vnd.curl.pcurl",
  "application/vnd.dart",
  "application/vnd.data-vision.rdz",
  "application/vnd.dece.data",
  "application/vnd.dece.ttml+xml",
  "application/vnd.dece.unspecified",
  "application/vnd.dece.zip",
  "application/vnd.denovo.fcselayout-link",
  "application/vnd.dna",
  "application/vnd.dolby.mlp",
  "application/vnd.dpgraph",
  "application/vnd.dreamfactory",
  "application/vnd.ds-keypoint",
  "application/vnd.dvb.ait",
  "application/vnd.dvb.service",
  "application/vnd.dynageo",
  "application/vnd.ecowin.chart",
  "application/vnd.enliven",
  "application/vnd.epson.esf",
  "application/vnd.epson.msf",
  "application/vnd.epson.quickanime",
  "application/vnd.epson.salt",
  "application/vnd.epson.ssf",
  "application/vnd.eszigno3+xml",
  "application/vnd.ezpix-album",
  "application/vnd.ezpix-package",
  "application/vnd.fdf",
  "application/vnd.fdsn.mseed",
  "application/vnd.fdsn.seed",
  "application/vnd.flographit",
  "application/vnd.fluxtime.clip",
  "application/vnd.framemaker",
  "application/vnd.frogans.fnc",
  "application/vnd.frogans.ltf",
  "application/vnd.fsc.weblaunch",
  "application/vnd.fujitsu.oasys",
  "application/vnd.fujitsu.oasys2",
  "application/vnd.fujitsu.oasys3",
  "application/vnd.fujitsu.oasysgp",
  "application/vnd.fujitsu.oasysprs",
  "application/vnd.fujixerox.ddd",
  "application/vnd.fujixerox.docuworks",
  "application/vnd.fujixerox.docuworks.binder",
  "application/vnd.fuzzysheet",
  "application/vnd.genomatix.tuxedo",
  "application/vnd.geogebra.file",
  "application/vnd.geogebra.tool",
  "application/vnd.geometry-explorer",
  "application/vnd.geonext",
  "application/vnd.geoplan",
  "application/vnd.geospace",
  "application/vnd.gmx",
  "application/vnd.google-earth.kml+xml",
  "application/vnd.google-earth.kmz",
  "application/vnd.grafeq",
  "application/vnd.groove-account",
  "application/vnd.groove-help",
  "application/vnd.groove-identity-message",
  "application/vnd.groove-injector",
  "application/vnd.groove-tool-message",
  "application/vnd.groove-tool-template",
  "application/vnd.groove-vcard",
  "application/vnd.hal+xml",
  "application/vnd.handheld-entertainment+xml",
  "application/vnd.hbci",
  "application/vnd.hhe.lesson-player",
  "application/vnd.hp-hpgl",
  "application/vnd.hp-hpid",
  "application/vnd.hp-hps",
  "application/vnd.hp-jlyt",
  "application/vnd.hp-pcl",
  "application/vnd.hp-pclxl",
  "application/vnd.hydrostatix.sof-data",
  "application/vnd.ibm.minipay",
  "application/vnd.ibm.modcap",
  "application/vnd.ibm.rights-management",
  "application/vnd.ibm.secure-container",
  "application/vnd.iccprofile",
  "application/vnd.igloader",
  "application/vnd.immervision-ivp",
  "application/vnd.immervision-ivu",
  "application/vnd.insors.igm",
  "application/vnd.intercon.formnet",
  "application/vnd.intergeo",
  "application/vnd.intu.qbo",
  "application/vnd.intu.qfx",
  "application/vnd.ipunplugged.rcprofile",
  "application/vnd.irepository.package+xml",
  "application/vnd.is-xpr",
  "application/vnd.isac.fcs",
  "application/vnd.jam",
  "application/vnd.jcp.javame.midlet-rms",
  "application/vnd.jisp",
  "application/vnd.joost.joda-archive",
  "application/vnd.kahootz",
  "application/vnd.kde.karbon",
  "application/vnd.kde.kchart",
  "application/vnd.kde.kformula",
  "application/vnd.kde.kivio",
  "application/vnd.kde.kontour",
  "application/vnd.kde.kpresenter",
  "application/vnd.kde.kspread",
  "application/vnd.kde.kword",
  "application/vnd.kenameaapp",
  "application/vnd.kidspiration",
  "application/vnd.kinar",
  "application/vnd.koan",
  "application/vnd.kodak-descriptor",
  "application/vnd.las.las+xml",
  "application/vnd.llamagraphics.life-balance.desktop",
  "application/vnd.llamagraphics.life-balance.exchange+xml",
  "application/vnd.lotus-1-2-3",
  "application/vnd.lotus-approach",
  "application/vnd.lotus-freelance",
  "application/vnd.lotus-notes",
  "application/vnd.lotus-organizer",
  "application/vnd.lotus-screencam",
  "application/vnd.lotus-wordpro",
  "application/vnd.macports.portpkg",
  "application/vnd.mcd",
  "application/vnd.medcalcdata",
  "application/vnd.mediastation.cdkey",
  "application/vnd.mfer",
  "application/vnd.mfmp",
  "application/vnd.micrografx.flo",
  "application/vnd.micrografx.igx",
  "application/vnd.mif",
  "application/vnd.mobius.daf",
  "application/vnd.mobius.dis",
  "application/vnd.mobius.mbk",
  "application/vnd.mobius.mqy",
  "application/vnd.mobius.msl",
  "application/vnd.mobius.plc",
  "application/vnd.mobius.txf",
  "application/vnd.mophun.application",
  "application/vnd.mophun.certificate",
  "application/vnd.mozilla.xul+xml",
  "application/vnd.ms-artgalry",
  "application/vnd.ms-cab-compressed",
  "application/vnd.ms-excel",
  "application/vnd.ms-excel.addin.macroenabled.12",
  "application/vnd.ms-excel.sheet.binary.macroenabled.12",
  "application/vnd.ms-excel.sheet.macroenabled.12",
  "application/vnd.ms-excel.template.macroenabled.12",
  "application/vnd.ms-fontobject",
  "application/vnd.ms-htmlhelp",
  "application/vnd.ms-ims",
  "application/vnd.ms-lrm",
  "application/vnd.ms-officetheme",
  "application/vnd.ms-pki.seccat",
  "application/vnd.ms-pki.stl",
  "application/vnd.ms-powerpoint",
  "application/vnd.ms-powerpoint.addin.macroenabled.12",
  "application/vnd.ms-powerpoint.presentation.macroenabled.12",
  "application/vnd.ms-powerpoint.slide.macroenabled.12",
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
  "application/vnd.ms-powerpoint.template.macroenabled.12",
  "application/vnd.ms-project",
  "application/vnd.ms-word.document.macroenabled.12",
  "application/vnd.ms-word.template.macroenabled.12",
  "application/vnd.ms-works",
  "application/vnd.ms-wpl",
  "application/vnd.ms-xpsdocument",
  "application/vnd.mseq",
  "application/vnd.musician",
  "application/vnd.muvee.style",
  "application/vnd.mynfc",
  "application/vnd.neurolanguage.nlu",
  "application/vnd.nitf",
  "application/vnd.noblenet-directory",
  "application/vnd.noblenet-sealer",
  "application/vnd.noblenet-web",
  "application/vnd.nokia.n-gage.data",
  "application/vnd.nokia.n-gage.symbian.install",
  "application/vnd.nokia.radio-preset",
  "application/vnd.nokia.radio-presets",
  "application/vnd.novadigm.edm",
  "application/vnd.novadigm.edx",
  "application/vnd.novadigm.ext",
  "application/vnd.oasis.opendocument.chart",
  "application/vnd.oasis.opendocument.chart-template",
  "application/vnd.oasis.opendocument.database",
  "application/vnd.oasis.opendocument.formula",
  "application/vnd.oasis.opendocument.formula-template",
  "application/vnd.oasis.opendocument.graphics",
  "application/vnd.oasis.opendocument.graphics-template",
  "application/vnd.oasis.opendocument.image",
  "application/vnd.oasis.opendocument.image-template",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.oasis.opendocument.presentation-template",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.spreadsheet-template",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.text-master",
  "application/vnd.oasis.opendocument.text-template",
  "application/vnd.oasis.opendocument.text-web",
  "application/vnd.olpc-sugar",
  "application/vnd.oma.dd2+xml",
  "application/vnd.openofficeorg.extension",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.presentationml.slide",
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  "application/vnd.openxmlformats-officedocument.presentationml.template",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  "application/vnd.osgeo.mapguide.package",
  "application/vnd.osgi.dp",
  "application/vnd.osgi.subsystem",
  "application/vnd.palm",
  "application/vnd.pawaafile",
  "application/vnd.pg.format",
  "application/vnd.pg.osasli",
  "application/vnd.picsel",
  "application/vnd.pmi.widget",
  "application/vnd.pocketlearn",
  "application/vnd.powerbuilder6",
  "application/vnd.previewsystems.box",
  "application/vnd.proteus.magazine",
  "application/vnd.publishare-delta-tree",
  "application/vnd.pvi.ptid1",
  "application/vnd.quark.quarkxpress",
  "application/vnd.realvnc.bed",
  "application/vnd.recordare.musicxml",
  "application/vnd.recordare.musicxml+xml",
  "application/vnd.rig.cryptonote",
  "application/vnd.rim.cod",
  "application/vnd.rn-realmedia",
  "application/vnd.rn-realmedia-vbr",
  "application/vnd.route66.link66+xml",
  "application/vnd.sailingtracker.track",
  "application/vnd.seemail",
  "application/vnd.sema",
  "application/vnd.semd",
  "application/vnd.semf",
  "application/vnd.shana.informed.formdata",
  "application/vnd.shana.informed.formtemplate",
  "application/vnd.shana.informed.interchange",
  "application/vnd.shana.informed.package",
  "application/vnd.simtech-mindmapper",
  "application/vnd.smaf",
  "application/vnd.smart.teacher",
  "application/vnd.solent.sdkm+xml",
  "application/vnd.spotfire.dxp",
  "application/vnd.spotfire.sfs",
  "application/vnd.stardivision.calc",
  "application/vnd.stardivision.draw",
  "application/vnd.stardivision.impress",
  "application/vnd.stardivision.math",
  "application/vnd.stardivision.writer",
  "application/vnd.stardivision.writer-global",
  "application/vnd.stepmania.package",
  "application/vnd.stepmania.stepchart",
  "application/vnd.sun.xml.calc",
  "application/vnd.sun.xml.calc.template",
  "application/vnd.sun.xml.draw",
  "application/vnd.sun.xml.draw.template",
  "application/vnd.sun.xml.impress",
  "application/vnd.sun.xml.impress.template",
  "application/vnd.sun.xml.math",
  "application/vnd.sun.xml.writer",
  "application/vnd.sun.xml.writer.global",
  "application/vnd.sun.xml.writer.template",
  "application/vnd.sus-calendar",
  "application/vnd.svd",
  "application/vnd.symbian.install",
  "application/vnd.syncml+xml",
  "application/vnd.syncml.dm+wbxml",
  "application/vnd.syncml.dm+xml",
  "application/vnd.tao.intent-module-archive",
  "application/vnd.tcpdump.pcap",
  "application/vnd.tmobile-livetv",
  "application/vnd.trid.tpt",
  "application/vnd.triscape.mxs",
  "application/vnd.trueapp",
  "application/vnd.ufdl",
  "application/vnd.uiq.theme",
  "application/vnd.umajin",
  "application/vnd.unity",
  "application/vnd.uoml+xml",
  "application/vnd.vcx",
  "application/vnd.visio",
  "application/vnd.visionary",
  "application/vnd.vsf",
  "application/vnd.wap.wbxml",
  "application/vnd.wap.wmlc",
  "application/vnd.wap.wmlscriptc",
  "application/vnd.webturbo",
  "application/vnd.wolfram.player",
  "application/vnd.wordperfect",
  "application/vnd.wqd",
  "application/vnd.wt.stf",
  "application/vnd.xara",
  "application/vnd.xfdl",
  "application/vnd.yamaha.hv-dic",
  "application/vnd.yamaha.hv-script",
  "application/vnd.yamaha.hv-voice",
  "application/vnd.yamaha.openscoreformat",
  "application/vnd.yamaha.openscoreformat.osfpvg+xml",
  "application/vnd.yamaha.smaf-audio",
  "application/vnd.yamaha.smaf-phrase",
  "application/vnd.yellowriver-custom-menu",
  "application/vnd.zul",
  "application/vnd.zzazz.deck+xml",
  "application/voicexml+xml",
  "application/widget",
  "application/winhlp",
  "application/wsdl+xml",
  "application/wspolicy+xml",
  "application/x-7z-compressed",
  "application/x-abiword",
  "application/x-ace-compressed",
  "application/x-apple-diskimage",
  "application/x-authorware-bin",
  "application/x-authorware-map",
  "application/x-authorware-seg",
  "application/x-bcpio",
  "application/x-bittorrent",
  "application/x-blorb",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-cbr",
  "application/x-cdlink",
  "application/x-cfs-compressed",
  "application/x-chat",
  "application/x-chess-pgn",
  "application/x-conference",
  "application/x-cpio",
  "application/x-csh",
  "application/x-debian-package",
  "application/x-dgc-compressed",
  "application/x-director",
  "application/x-doom",
  "application/x-dtbncx+xml",
  "application/x-dtbook+xml",
  "application/x-dtbresource+xml",
  "application/x-dvi",
  "application/x-envoy",
  "application/x-eva",
  "application/x-font-bdf",
  "application/x-font-ghostscript",
  "application/x-font-linux-psf",
  "application/x-font-otf",
  "application/x-font-pcf",
  "application/x-font-snf",
  "application/x-font-ttf",
  "application/x-font-type1",
  "application/x-freearc",
  "application/x-futuresplash",
  "application/x-gca-compressed",
  "application/x-glulx",
  "application/x-gnumeric",
  "application/x-gramps-xml",
  "application/x-gtar",
  "application/x-hdf",
  "application/x-install-instructions",
  "application/x-iso9660-image",
  "application/x-java-jnlp-file",
  "application/x-latex",
  "application/x-lzh-compressed",
  "application/x-mie",
  "application/x-mobipocket-ebook",
  "application/x-ms-application",
  "application/x-ms-shortcut",
  "application/x-ms-wmd",
  "application/x-ms-wmz",
  "application/x-ms-xbap",
  "application/x-msaccess",
  "application/x-msbinder",
  "application/x-mscardfile",
  "application/x-msclip",
  "application/x-msdownload",
  "application/x-msmediaview",
  "application/x-msmetafile",
  "application/x-msmoney",
  "application/x-mspublisher",
  "application/x-msschedule",
  "application/x-msterminal",
  "application/x-mswrite",
  "application/x-netcdf",
  "application/x-nzb",
  "application/x-pkcs12",
  "application/x-pkcs7-certificates",
  "application/x-pkcs7-certreqresp",
  "application/x-rar-compressed",
  "application/x-research-info-systems",
  "application/x-sh",
  "application/x-shar",
  "application/x-shockwave-flash",
  "application/x-silverlight-app",
  "application/x-sql",
  "application/x-stuffit",
  "application/x-stuffitx",
  "application/x-subrip",
  "application/x-sv4cpio",
  "application/x-sv4crc",
  "application/x-t3vm-image",
  "application/x-tads",
  "application/x-tar",
  "application/x-tcl",
  "application/x-tex",
  "application/x-tex-tfm",
  "application/x-texinfo",
  "application/x-tgif",
  "application/x-ustar",
  "application/x-wais-source",
  "application/x-x509-ca-cert",
  "application/x-xfig",
  "application/x-xliff+xml",
  "application/x-xpinstall",
  "application/x-xz",
  "application/x-zmachine",
  "application/xaml+xml",
  "application/xcap-diff+xml",
  "application/xenc+xml",
  "application/xhtml+xml",
  "application/xml",
  "application/xml-dtd",
  "application/xop+xml",
  "application/xproc+xml",
  "application/xslt+xml",
  "application/xspf+xml",
  "application/xv+xml",
  "application/yang",
  "application/yin+xml",
  "application/zip",
  "audio/adpcm",
  "audio/basic",
  "audio/midi",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/s3m",
  "audio/silk",
  "audio/vnd.dece.audio",
  "audio/vnd.digital-winds",
  "audio/vnd.dra",
  "audio/vnd.dts",
  "audio/vnd.dts.hd",
  "audio/vnd.lucent.voice",
  "audio/vnd.ms-playready.media.pya",
  "audio/vnd.nuera.ecelp4800",
  "audio/vnd.nuera.ecelp7470",
  "audio/vnd.nuera.ecelp9600",
  "audio/vnd.rip",
  "audio/webm",
  "audio/x-aac",
  "audio/x-aiff",
  "audio/x-caf",
  "audio/x-flac",
  "audio/x-matroska",
  "audio/x-mpegurl",
  "audio/x-ms-wax",
  "audio/x-ms-wma",
  "audio/x-pn-realaudio",
  "audio/x-pn-realaudio-plugin",
  "audio/x-wav",
  "audio/xm",
  "chemical/x-cdx",
  "chemical/x-cif",
  "chemical/x-cmdf",
  "chemical/x-cml",
  "chemical/x-csml",
  "chemical/x-xyz",
  "image/bmp",
  "image/cgm",
  "image/g3fax",
  "image/gif",
  "image/ief",
  "image/jpeg",
  "image/ktx",
  "image/png",
  "image/prs.btif",
  "image/sgi",
  "image/svg+xml",
  "image/tiff",
  "image/vnd.adobe.photoshop",
  "image/vnd.dece.graphic",
  "image/vnd.djvu",
  "image/vnd.dvb.subtitle",
  "image/vnd.dwg",
  "image/vnd.dxf",
  "image/vnd.fastbidsheet",
  "image/vnd.fpx",
  "image/vnd.fst",
  "image/vnd.fujixerox.edmics-mmr",
  "image/vnd.fujixerox.edmics-rlc",
  "image/vnd.ms-modi",
  "image/vnd.ms-photo",
  "image/vnd.net-fpx",
  "image/vnd.wap.wbmp",
  "image/vnd.xiff",
  "image/webp",
  "image/x-3ds",
  "image/x-cmu-raster",
  "image/x-cmx",
  "image/x-freehand",
  "image/x-icon",
  "image/x-mrsid-image",
  "image/x-pcx",
  "image/x-pict",
  "image/x-portable-anymap",
  "image/x-portable-bitmap",
  "image/x-portable-graymap",
  "image/x-portable-pixmap",
  "image/x-rgb",
  "image/x-tga",
  "image/x-xbitmap",
  "image/x-xpixmap",
  "image/x-xwindowdump",
  "message/rfc822",
  "model/iges",
  "model/mesh",
  "model/vnd.collada+xml",
  "model/vnd.dwf",
  "model/vnd.gdl",
  "model/vnd.gtw",
  "model/vnd.mts",
  "model/vnd.vtu",
  "model/vrml",
  "model/x3d+binary",
  "model/x3d+vrml",
  "model/x3d+xml",
  "text/cache-manifest",
  "text/calendar",
  "text/css",
  "text/csv",
  "text/html",
  "text/n3",
  "text/plain",
  "text/prs.lines.tag",
  "text/richtext",
  "text/sgml",
  "text/tab-separated-values",
  "text/troff",
  "text/turtle",
  "text/uri-list",
  "text/vcard",
  "text/vnd.curl",
  "text/vnd.curl.dcurl",
  "text/vnd.curl.mcurl",
  "text/vnd.curl.scurl",
  "text/vnd.dvb.subtitle",
  "text/vnd.fly",
  "text/vnd.fmi.flexstor",
  "text/vnd.graphviz",
  "text/vnd.in3d.3dml",
  "text/vnd.in3d.spot",
  "text/vnd.sun.j2me.app-descriptor",
  "text/vnd.wap.wml",
  "text/vnd.wap.wmlscript",
  "text/x-asm",
  "text/x-c",
  "text/x-fortran",
  "text/x-java-source",
  "text/x-nfo",
  "text/x-opml",
  "text/x-pascal",
  "text/x-setext",
  "text/x-sfv",
  "text/x-uuencode",
  "text/x-vcalendar",
  "text/x-vcard",
  "video/3gpp",
  "video/3gpp2",
  "video/h261",
  "video/h263",
  "video/h264",
  "video/jpeg",
  "video/jpm",
  "video/mj2",
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/vnd.dece.hd",
  "video/vnd.dece.mobile",
  "video/vnd.dece.pd",
  "video/vnd.dece.sd",
  "video/vnd.dece.video",
  "video/vnd.dvb.file",
  "video/vnd.fvt",
  "video/vnd.mpegurl",
  "video/vnd.ms-playready.media.pyv",
  "video/vnd.uvvu.mp4",
  "video/vnd.vivo",
  "video/webm",
  "video/x-f4v",
  "video/x-fli",
  "video/x-flv",
  "video/x-m4v",
  "video/x-matroska",
  "video/x-mng",
  "video/x-ms-asf",
  "video/x-ms-vob",
  "video/x-ms-wm",
  "video/x-ms-wmv",
  "video/x-ms-wmx",
  "video/x-ms-wvx",
  "video/x-msvideo",
  "video/x-sgi-movie",
  "video/x-smv",
  "x-conference/x-cooltalk"
]

},{}],4:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'select'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('select'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.select);
        global.clipboardAction = mod.exports;
    }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.container = options.container;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                this.container.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    this.container.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    this.container.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.trigger) {
                    this.trigger.focus();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});
},{"select":11}],5:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './clipboard-action', 'tiny-emitter', 'good-listener'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
        global.clipboard = mod.exports;
    }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                this.container = _typeof(options.container) === 'object' ? options.container : document.body;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new _clipboardAction2.default({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    container: this.container,
                    trigger: trigger,
                    emitter: this
                });
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }], [{
            key: 'isSupported',
            value: function isSupported() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                var actions = typeof action === 'string' ? [action] : action;
                var support = !!document.queryCommandSupported;

                actions.forEach(function (action) {
                    support = support && !!document.queryCommandSupported(action);
                });

                return support;
            }
        }]);

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});
},{"./clipboard-action":4,"good-listener":9,"tiny-emitter":12}],6:[function(require,module,exports){
var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;

},{}],7:[function(require,module,exports){
var closest = require('./closest');

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"./closest":6}],8:[function(require,module,exports){
/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};

},{}],9:[function(require,module,exports){
var is = require('./is');
var delegate = require('delegate');

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;

},{"./is":8,"delegate":7}],10:[function(require,module,exports){
(function(root) {
  'use strict';

  var urlMatcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/

  var splitMatcher = /((?:\w+:)?\/\/(?:[^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*)/g

  function isUrl(string){
    return urlMatcher.test(string)
  }

  function hyperlinkify(text, attrsCallback) {
    try {
      text = text.toString()
    } catch(error) {}

    if (typeof text !== 'string') return ''

    return text.split(splitMatcher).map(function(value) {
      if (isUrl(value)) {
        var attrsObj = {}
        var attrs = []

        if (typeof attrsCallback === 'function') {
          attrsObj = attrsCallback(value)
        } else if (attrsCallback instanceof Object) {
          attrsObj = attrsCallback
        }

        if (attrsObj instanceof Object) {
          for (var key in attrsObj) {
            attrs.push(key + '="' + attrsObj[key] + '"')
          }
        }

        var attrsString = attrs.length ? ' ' + attrs.join(' ') : ''

        return '<a href="' + value + '"' + attrsString + '>' + value + '</a>'
      }

      return value
    }).join('')
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = hyperlinkify
    }
    exports.hyperlinkify = hyperlinkify
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return hyperlinkify
    });
  } else {
    root.hyperlinkify = hyperlinkify;
  }

})(this);
},{}],11:[function(require,module,exports){
function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;

},{}],12:[function(require,module,exports){
function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}],13:[function(require,module,exports){
const hyperlinkify = require('hyperlinkify')
const Clipboard = require('clipboard')
const {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
} = require('arraybuffer-mime')

const {pathname, host, protocol}  = window.location
const ws = new WebSocket(`${protocol === 'https:' ? `wss` : `ws`}://${host}${pathname}`)

ws.binaryType = 'arraybuffer'

const log = document.querySelector(`#log`)
const form = document.querySelector(`#form`)
const input = document.querySelector(`#input`)
const text = document.querySelector(`#text`)
const fileInput = document.querySelector(`#file`)
const output = document.querySelector(`#output`)
const shareUrl = document.querySelector(`#share-url`)

function setClipboard(element) {
  const clipboard = new Clipboard(element)

  clipboard.on('success', function(event) {
    const target = event.trigger
    target.textContent = 'copied!'

    setTimeout(function() {
      target.textContent = 'copy'
    }, 3e3)
  })

  element.addEventListener('click', event => {
    event.preventDefault()
  })
}

shareUrl.value = window.location.href
shareUrl.addEventListener(`click`, event => {
  event.currentTarget.select()
}, false)

function logMessage(data) {
  log.innerHTML = JSON.stringify(data, null, 2)
}

function create(type) {
  if (type === `text`) {
    return text => {
      const t = document.createTextNode(text)
      return t
    }
  }

  return document.createElement(type)
}

form.addEventListener(`submit`, event => {
  event.preventDefault()

  // text stream
  const inputs = [text, input]
  inputs.forEach(x => {
    const value = x.value
    if (value) {
      //console.log(`value`, value)
      const mime = 'text/plain'
      const blob = new Blob([value], {type: mime})
      const reader = new FileReader()

      reader.addEventListener('load', (event) => {
        const arrayBuffer = reader.result
        sendArrayBuffer(arrayBuffer, mime)
      })

      reader.readAsArrayBuffer(blob)
      x.value = ``
    }
  })

  // file upload
  const files = [].slice.call(fileInput.files)

  files.forEach(file => {
    console.log(`file:`, file, file.type)
    if (!file) return

    const reader = new FileReader()

    const readFile = (event) => {
      const arrayBuffer = reader.result
      const mime = file.type
      sendArrayBuffer(arrayBuffer, mime)
    }

    reader.addEventListener('load', readFile)
    reader.readAsArrayBuffer(file)
  })

  fileInput.value = ''

}, false)

function sendArrayBuffer(arrayBuffer, mime) {
  const abWithMime = arrayBufferWithMime(arrayBuffer, mime)
  ws.send(abWithMime)
}

ws.addEventListener('message', event => {
  const data = event.data

  console.log('incoming...')

  try {
    const json = JSON.parse(data)
    if (json.__server_message__) {
      logMessage(json.__server_message__.data)
      return false
    }
  } catch(error) {

  }

  const doc = document.createDocumentFragment()
  const el = create(`div`)
  el.classList.add(`item`)

  const {mime, arrayBuffer} = arrayBufferMimeDecouple(data)

  console.log('received', mime)

  const blob = new Blob([arrayBuffer], {type: mime})

  let ext = mime.split(`/`).join(`_`).replace(/[^\w\d_]/gi, ``)
  const url = window.URL.createObjectURL(blob)

  const tpd = create(`div`)
  tpd.appendChild(create(`text`)(`${blob.type} size:${blob.size}B`))
  doc.appendChild(tpd)

  const a = create(`a`)
  a.appendChild(create(`text`)(url))
  a.title = `view asset`
  a.href = url
  a.target = `_blank`
  doc.appendChild(a)

  const dv = create(`article`)

  let clipboardNode = null

  if (/image/gi.test(mime)) {
    const img = create(`img`)
    img.src = url
    dv.appendChild(img)
  } else if (/video/gi.test(mime)) {
    const dv = create(`div`)
    const vid = create(`video`)
    vid.src = url
    vid.controls = `controls`
    dv.appendChild(vid)
  } else if (/audio/gi.test(mime)) {
    const aud = create(`audio`)
    aud.src = url
    aud.controls = `controls`
    dv.appendChild(aud)
  } else if (/zip/gi.test(mime)) {
    const pr = create(`text`)('.zip')
    dv.appendChild(pr)
  } else if (/pdf/gi.test(mime)) {
    const pr = create(`text`)('.pdf')
    dv.appendChild(pr)
  //} else if (/(json|javascript|text)/gi.test(mime)) {
  } else {
    const reader = new FileReader();
    reader.onload = (event) => {
      const t = reader.result
      const pr = create(`code`)
      pr.id = `id_${Date.now()}`
      clipboardNode = pr
      pr.innerHTML = hyperlinkify(t, {target: '_blank'})
      dv.appendChild(pr)

      const cp = create(`a`)
      cp.id = `cp_id_${Date.now()}`
      cp.href='#'
      cp.className = `copy`
      cp.title = `copy to clipboard`
      cp.dataset.clipboardTarget = `#${clipboardNode.id}`
      const cpt = create(`text`)(`copy`)
      setClipboard(cp)
      cp.appendChild(cpt)
      btdl.appendChild(cp)
    }

    reader.readAsText(blob)
  }

  doc.appendChild(dv)

  const filename = `${Date.now()}_${ext}`
  const dla = create(`a`)
  dla.className = `download`
  dla.title = `download asset`
  dla.href = url
  dla.download = filename
  const dlat = create(`text`)(`download`)
  dla.appendChild(dlat)

  const btd = create(`footer`)
  const btdl = create(`div`)
  btdl.appendChild(dla)
  btd.appendChild(btdl)

  const dt = create(`time`)
  const dtt = create(`text`)((new Date()).toString())
  dt.appendChild(dtt)
  btd.appendChild(dt)
  doc.appendChild(btd)

  el.appendChild(doc)
  output.insertBefore(el, output.firstChild)
})

ws.addEventListener(`open`, () => {
  console.log(`connected`)
})

ws.addEventListener(`close`, () => {
  console.log(`connection closed`)
})

},{"arraybuffer-mime":2,"clipboard":5,"hyperlinkify":10}]},{},[13]);
