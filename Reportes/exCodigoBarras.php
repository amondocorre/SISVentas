<?php
date_default_timezone_set('America/La_Paz'); 

require_once "../model/Ingreso.php";
require('Ingreso.php');
session_start();
$lo = $_SESSION["logo"];
require_once "../model/Configuracion.php";
$objConf = new Configuracion();
$query_conf = $objConf->Listar();
$regConf = $query_conf->fetch_object();
$idIngreso = isset($_GET["id"]) ? $_GET["id"] : 0;
if ($idIngreso <= 0) {
    die("Error: ID de Ingreso no proporcionado o inválido.");
}
$obIngreso = new Ingreso();
//$pdf = new PDF_Invoice('P', 'mm', 'A4');
//$pdf = new PDF_Invoice('P', 'mm', [80, 80]);
$pageLayout = array(22, 80);
$pdf = new PDF_Invoice('L', 'mm', $pageLayout, true, 'UTF-8', false);
//$pdf->AddPage();
$query_ped = $obIngreso->GetDetalleArticulo($idIngreso);
$y = 5;
while ($reg_det = $query_ped->fetch_object()) { 
    $pdf->AddPage(); 
    $y = 5;
    $cod = ($reg_det->codigo != "") ? $reg_det->codigo : "-";
    $barcode_image_path = '../Files/barcode/' . $reg_det->iddetalle_ingreso . '.png';
    if (file_exists($barcode_image_path)) {
        $pdf->Image($barcode_image_path, 10, $y, 60, 10); 
        $pdf->SetFont('Arial', '', 12); 
        $text_width = $pdf->GetStringWidth($reg_det->codigo);
        $text_x = (80 - $text_width) / 2;
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
$pdf->Output('Reporte de Ingreso.pdf', 'I'); 
?>