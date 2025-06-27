<?php
date_default_timezone_set('America/La_Paz'); 

require_once "../model/Ingreso.php";
require('Ingreso.php');
require_once '../model/Barcode.php';
session_start();
$lo = $_SESSION["logo"];
require_once "../model/Configuracion.php";
require_once "../model/Pedido.php";
$objConf = new Configuracion();
$objPedido = new Pedido();
$barcode = new Barcode();
$query_conf = $objConf->Listar();
$regConf = $query_conf->fetch_object();
$idIngreso = isset($_GET["id"]) ? $_GET["id"] : 0;
if ($idIngreso <= 0) {
    die("Error: ID de Ingreso no proporcionado o inválido.");
}
$query_cli = $objPedido->GetVenta($_GET["id"]);
$reg_cli = $query_cli->fetch_object();
$query_ped = $objPedido->ImprimirDetallePedido($_GET["id"]);
$query_total = $objPedido->TotalPedido($_GET["id"]);
$reg_total = $query_total->fetch_object();

$pageLayout = array(110+($query_ped->num_rows*5), 80);
$pdf = new PDF_Invoice('P', 'mm', $pageLayout, true, 'UTF-8', false);
$pdf->SetMargins(5, 5, 5); // <- aquí defines los márgenes
$pdf->AddPage(); 
$pdf->SetFont('Arial', 'B', 18); 
$pdf->Cell(0, 8, ".::".$reg_cli->razon_social."::.", 0, 1, 'C');
$pdf->SetFont('Helvetica', '', 7);
$pdf->SetX(5); 
$pdf->MultiCell(70, 4, $reg_cli->direccion, 0, 'C');
$pdf->SetX(5); 
$pdf->MultiCell(70, 4, $reg_cli->telefono_suc.' '.$reg_cli->tipo_documento.' '.$reg_cli->num_sucursal, 0, 'C');
$pdf->SetX(5); 
$pdf->SetFont('Helvetica', '', 8); 
$pdf->MultiCell(70, 4, "Fecha/Hora: ".date("Y-m-d H:i:s"), 0, 'C');
$pdf->SetX(5);
$pdf->Ln(1);
$pdf->SetFont('Helvetica', '', 12); 
$pdf->MultiCell(70, 5,"Cliente: ". $reg_cli->nombre, 0, 'L');
$pdf->SetX(5); 
$pdf->MultiCell(70, 5, "Doc: ".$reg_cli->doc.": ".$reg_cli->num_documento, 0, 'L');
$pdf->Cell(0, 8, utf8_decode("Nº de venta: ".$reg_cli->serie_comprobante." - ".$reg_cli->num_comprobante), 0, 1, 'L');
$pdf->SetX(5); 
$pdf->SetFont('Helvetica', '', 8); 
$pdf->Cell(10, 5, "CANT.", 0, 0, '');
$pdf->Cell(40, 5, utf8_decode("DESCRIPCIÓN"), 0, 0, '');
$pdf->Cell(20, 5, "IMPORTE", 0, 1, '');
$pdf->Cell(70, 1, "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -", 0, 1, '');
$pdf->Cell(70, 1, "", 0, 1, '');
$descuento =0;
$subTotal =0;
while ($reg = $query_ped->fetch_object()) {
  $pdf->SetFont('Helvetica', '', 8); 
  $pdf->Cell(10, 5, $reg->cantidad , 0, 0, '');
  $pdf->Cell(40, 5, utf8_decode($reg->articulo.""), 0, 0, '');
  $pdf->Cell(20, 5, "".$regConf->simbolo_moneda." ".$reg->precio_venta."", 0, 1, '');
  $subTotal += $reg->precio_venta;
  $descuento += $reg->precio_venta*($reg->descuento/100);
  //echo "<td>".. "Serie:".$reg->serie."</td>";
}

$pdf->Cell(50, 5, "SUBTOTAL: ", 0, 0, 'R');
$pdf->Cell(20, 5, $regConf->simbolo_moneda." ".number_format($subTotal,2), 0, 1, '');
$pdf->Cell(50, 5, "DESCUENTO: ", 0, 0, 'R');
$pdf->Cell(20, 5, $regConf->simbolo_moneda." ".number_format($descuento,2), 0, 1, '');
$pdf->Cell(50, 5, "TOTAL: ", 0, 0, 'R');
$pdf->Cell(20, 5, $regConf->simbolo_moneda." ".number_format($reg_total->Total,2), 0, 1, '');
$pdf->Ln(2);
$pdf->Cell(79, 5, utf8_decode("Nº de artículos: ".$query_ped->num_rows), 0, 1, '');
$pdf->Ln(2);
$pdf->Cell(70, 5, utf8_decode("¡Gracias por su compra!"), 0, 0, 'C');
$pdf->Output('ticket.pdf', 'I'); 