<?php
	//$conexion = new mysqli("localhost", "root", "", "ventas");
	//$conexion = new mysqli("67.225.151.112", "vanguard_admin_hotel", "Hotel.hackers.", "vanguard_Tienda");
	$conexion = new mysqli("localhost", "vanguard_admin_hotel", "Hotel.hackers.", "vanguard_Tienda");
	if (mysqli_connect_errno()) {
	    printf("Connect failed: %s\n", mysqli_connect_error());
	    exit();
	}