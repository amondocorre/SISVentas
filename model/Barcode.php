<?php
require "Conexion.php"; 
require '../vendor/autoload.php'; 

use Picqer\Barcode\BarcodeGeneratorPNG;
use Picqer\Barcode\BarcodeGeneratorSVG;
use Picqer\Barcode\BarcodeGeneratorJPG;
use Picqer\Barcode\BarcodeGeneratorHTML;

class Barcode {

    public function __construct() { }
    public function generate($codigo, $id) {
        $generator = new BarcodeGeneratorPNG();
        $barcodeImageData = $generator->getBarcode($codigo, $generator::TYPE_CODE_128);
        $rutaDestino = __DIR__ . '/../Files/barcode/' . $id . '.png';
        if (!is_dir(dirname($rutaDestino))) {
            mkdir(dirname($rutaDestino), 0777, true);
        }
        if (file_put_contents($rutaDestino, $barcodeImageData) !== false) {
            return $rutaDestino;
        } else {
            error_log("Failed to write barcode to: " . $rutaDestino);
            return false; 
        }
    }
}