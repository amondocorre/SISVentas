<?php
date_default_timezone_set('America/La_Paz'); 

require_once "../model/Ingreso.php";
require('Ingreso.php');
require_once '../model/Barcode.php';
session_start();
$lo = $_SESSION["logo"];
require_once "../model/Configuracion.php";
$objConf = new Configuracion();
$barcode = new Barcode();
$query_conf = $objConf->Listar();
$regConf = $query_conf->fetch_object();
$idIngreso = isset($_GET["id"]) ? $_GET["id"] : 0;
if ($idIngreso <= 0) {
    die("Error: ID de Ingreso no proporcionado o inválido.");
}
$obIngreso = new Ingreso();
$pageLayout = array(32, 80);
$pdf = new PDF_Invoice('L', 'mm', $pageLayout, true, 'UTF-8', false);
//$pdf->AddPage();
$query_ped = $obIngreso->GetDetalleArticulo($idIngreso);
$y = 5;
while ($reg_det = $query_ped->fetch_object()) { 
    $barcodeImageData = $barcode->generate2($reg_det->codigo);
    $tempFile = tempnam(sys_get_temp_dir(), $reg_det->iddetalle_ingreso) . '.png';
    file_put_contents($tempFile, $barcodeImageData);
    $stock_ingreso = $reg_det->stock_ingreso??0;
    for ($i=0; $i <$stock_ingreso ; $i++) { 
      if (file_exists($tempFile)) {
        $pdf->AddPage(); 
        $y = 8;
        $cod = ($reg_det->codigo != "") ? $reg_det->codigo : "-";
        $pdf->SetFont('Arial', '', 12); 
        $pdf->Text(3, $y, $reg_det->serie); 
        $pdf->SetFont('Helvetica', '', 12); 
        $pdf->Text(35, $y, "PRECIO: ".$reg_det->precio_ventapublico." Bs."); 
        $pdf->SetFont('Helvetica', '', 20); 
        //$pdf->Text(3, $y+15, $reg_det->categoria);
        $pdf->Text(3, $y+15, $reg_det->articulo);
        $y += 4;
        $pdf->Image($tempFile, 35, $y, 40, 12);
        $pdf->SetFont('Arial', '', 12); 
        $text_width = $pdf->GetStringWidth($reg_det->codigo);
        $text_x =12.5+((80 - $text_width) / 2);
        $pdf->SetFont('Arial', '', 10); 
        $pdf->Text($text_x, $y + 15, $reg_det->codigo); 
        $y += 25; 
        $pdf->SetFont('Arial', '', 10); 
      
      } else {
          $pdf->SetFont('Arial', 'I', 8);
          $pdf->Text($pdf->GetX() + 5, $y, "Cod. barras no encontrado");
          $y += 25;
          $pdf->SetFont('Arial', '', 10);
      }
    }
    unlink($tempFile);
}
$pdf->Output('Reporte de Ingreso.pdf', 'I'); 
?>